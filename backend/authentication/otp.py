import random
import resend
from django.conf import settings


def generate_otp() -> str:
    if settings.DEBUG:
        return "000000"
    return str(random.randint(100000, 999999))


def send_otp_email(email: str, otp: str) -> None:
    if settings.DEBUG:
        print(f"[DEV] OTP for {email}: {otp}")
        return

    resend.api_key = settings.RESEND_API_KEY

    resend.Emails.send({
        "from": settings.EMAIL_FROM,
        "to": email,
        "subject": "Your CampusAI Login Code",
        "html": f"""
            <h2>Your login code</h2>
            <p style="font-size:32px;font-weight:bold;letter-spacing:8px;">{otp}</p>
            <p>This code expires in 5 minutes. Do not share it with anyone.</p>
        """
    })
