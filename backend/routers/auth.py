import bcrypt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import database

router = APIRouter(prefix="/auth", tags=["auth"])


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())



class RegisterBody(BaseModel):
    email: str
    password: str
    name: str | None = None


class LoginBody(BaseModel):
    email: str
    password: str


class VerifyBody(BaseModel):
    email: str
    code: str


class ResendBody(BaseModel):
    email: str


@router.post("/register", status_code=201)
def register(body: RegisterBody):
    email = body.email.lower().strip()
    if not email or not body.password:
        raise HTTPException(400, "Email and password are required")

    existing = database.query("SELECT id FROM users WHERE email = %s", (email,))
    if existing:
        raise HTTPException(400, "User already exists")

    hashed = hash_password(body.password)

    if body.name:
        database.query(
            "INSERT INTO users (email, password, name, email_verified) VALUES (%s, %s, %s, TRUE)",
            (email, hashed, body.name),
        )
    else:
        database.query(
            "INSERT INTO users (email, password, email_verified) VALUES (%s, %s, TRUE)",
            (email, hashed),
        )

    return {"message": "User registered successfully.", "email": email}


@router.post("/login")
def login(body: LoginBody):
    email = body.email.lower().strip()
    rows = database.query("SELECT * FROM users WHERE email = %s", (email,))
    if not rows:
        raise HTTPException(400, "Invalid credentials")

    user = rows[0]
    if not verify_password(body.password, user["password"]):
        raise HTTPException(400, "Invalid credentials")

    return {
        "message": "Logged in successfully",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name"),
            "role": user.get("role", "free"),
            "created_at": str(user["created_at"]),
            "subscription_plan": user.get("subscription_plan") or "free",
            "subscription_end_date": str(user["subscription_end_date"]) if user.get("subscription_end_date") else None,
        },
    }


@router.post("/verify-email")
def verify_email(body: VerifyBody):
    email = body.email.lower().strip()
    rows = database.query("SELECT * FROM users WHERE email = %s", (email,))
    if not rows:
        raise HTTPException(404, "User not found")

    user = rows[0]
    if user.get("verification_code") != body.code:
        raise HTTPException(400, "Invalid verification code")

    database.query(
        "UPDATE users SET email_verified = TRUE, verification_code = NULL WHERE email = %s",
        (email,),
    )
    return {"message": "Email verified successfully"}


@router.post("/resend-code")
def resend_code(body: ResendBody):
    email = body.email.lower().strip()
    rows = database.query("SELECT * FROM users WHERE email = %s", (email,))
    if not rows:
        raise HTTPException(404, "User not found")

    user = rows[0]
    if user.get("email_verified"):
        raise HTTPException(400, "Email is already verified")

    code = generate_code()
    database.query("UPDATE users SET verification_code = %s WHERE email = %s", (code, email))
    sent = send_verification_email(email, code)
    if not sent:
        raise HTTPException(500, "Failed to send verification email")

    return {"message": "Verification code resent successfully"}
