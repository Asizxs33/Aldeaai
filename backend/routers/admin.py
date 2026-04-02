from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import database

router = APIRouter(prefix="/admin", tags=["admin"])

VALID_ROLES = {"free", "pro", "ultra", "moderator", "admin"}


@router.get("/stats")
def admin_stats():
    total = database.query("SELECT COUNT(*) as total FROM users")[0]["total"]

    try:
        role_rows = database.query("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        role_stats = {r["role"] or "free": int(r["count"]) for r in role_rows}
    except Exception:
        role_stats = {"free": int(total)}

    monthly = database.query(
        "SELECT COUNT(*) as count FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE)"
    )[0]["count"]
    today = database.query(
        "SELECT COUNT(*) as count FROM users WHERE created_at >= CURRENT_DATE"
    )[0]["count"]
    weekly = database.query(
        "SELECT DATE(created_at) as date, COUNT(*) as count FROM users "
        "WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' "
        "GROUP BY DATE(created_at) ORDER BY date"
    )

    return {
        "totalUsers": int(total),
        "roleStats": role_stats,
        "newUsersThisMonth": int(monthly),
        "newUsersToday": int(today),
        "weeklyStats": [{"date": str(r["date"]), "count": int(r["count"])} for r in weekly],
    }


@router.get("/users")
def list_users():
    rows = database.query("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC")
    return {"users": [dict(r, created_at=str(r["created_at"])) for r in rows]}


class RoleUpdate(BaseModel):
    userId: str
    role: str


@router.put("/users")
def update_user_role(body: RoleUpdate):
    if body.role.lower() not in VALID_ROLES:
        raise HTTPException(400, "Invalid role")
    database.query("UPDATE users SET role = $1 WHERE id = $2", (body.role.lower(), body.userId))
    return {"message": "User role updated successfully"}


class UserDelete(BaseModel):
    userId: str


@router.delete("/users")
def delete_user(body: UserDelete):
    database.query("DELETE FROM users WHERE id = $1", (body.userId,))
    return {"message": "User deleted successfully"}
