import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def send_verification_email(email: str, code: str) -> bool:
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASS")

    if not smtp_user or not smtp_pass:
        print(f"[Email Service] MOCK MODE — verification code for {email}: {code}")
        return True

    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_secure = os.environ.get("SMTP_SECURE", "false").lower() == "true"

    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb;">
        <h2 style="color: #2563eb; text-align: center;">Aldea AI</h2>
        <p style="font-size: 16px; color: #374151;">Сәлеметсіз бе!</p>
        <p style="font-size: 16px; color: #374151;">Төмендегі 6 таңбалы кодты пайдаланып, тіркелгіңізді растаңыз:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">{code}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280; text-align: center;">Егер сіз бұл тіркелгіні жасамаған болсаңыз, осы электрондық хатты елемеңіз.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2026 Aldea Academy. Барлық құқықтар қорғалған.</p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Aldea AI: Электрондық поштаны растау коды"
    msg["From"] = f"Aldea AI <{smtp_user}>"
    msg["To"] = email
    msg.attach(MIMEText(html, "html", "utf-8"))

    try:
        if smtp_secure:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, email, msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, email, msg.as_string())
        return True
    except Exception as e:
        print(f"[Email Service] Error sending email: {e}")
        return False
