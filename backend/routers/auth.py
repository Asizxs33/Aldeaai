import random
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
import database
from email_service import send_verification_email

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_code() -> str:
    return str(random.randint(100000, 999999))


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

    existing = database.query("SELECT id FROM users WHERE email = $1", (email,))
    if existing:
        raise HTTPException(400, "User already exists")

    hashed = pwd_ctx.hash(body.password)
    code = generate_code()

    if body.name:
        database.query(
            "INSERT INTO users (email, password, name, verification_code, email_verified) VALUES ($1, $2, $3, $4, FALSE)",
            (email, hashed, body.name, code),
        )
    else:
        database.query(
            "INSERT INTO users (email, password, verification_code, email_verified) VALUES ($1, $2, $3, FALSE)",
            (email, hashed, code),
        )

    send_verification_email(email, code)
    return {"message": "User registered successfully. Please verify your email.", "email": email}


@router.post("/login")
def login(body: LoginBody):
    email = body.email.lower().strip()
    rows = database.query("SELECT * FROM users WHERE email = $1", (email,))
    if not rows:
        raise HTTPException(400, "Invalid credentials")

    user = rows[0]
    if not pwd_ctx.verify(body.password, user["password"]):
        raise HTTPException(400, "Invalid credentials")

    if not user.get("email_verified"):
        raise HTTPException(401, detail={
            "message": "Email not verified",
            "email": user["email"],
            "requiresVerification": True,
        })

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
    rows = database.query("SELECT * FROM users WHERE email = $1", (email,))
    if not rows:
        raise HTTPException(404, "User not found")

    user = rows[0]
    if user.get("verification_code") != body.code:
        raise HTTPException(400, "Invalid verification code")

    database.query(
        "UPDATE users SET email_verified = TRUE, verification_code = NULL WHERE email = $1",
        (email,),
    )
    return {"message": "Email verified successfully"}


@router.post("/resend-code")
def resend_code(body: ResendBody):
    email = body.email.lower().strip()
    rows = database.query("SELECT * FROM users WHERE email = $1", (email,))
    if not rows:
        raise HTTPException(404, "User not found")

    user = rows[0]
    if user.get("email_verified"):
        raise HTTPException(400, "Email is already verified")

    code = generate_code()
    database.query("UPDATE users SET verification_code = $1 WHERE email = $2", (code, email))
    sent = send_verification_email(email, code)
    if not sent:
        raise HTTPException(500, "Failed to send verification email")

    return {"message": "Verification code resent successfully"}
