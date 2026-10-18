from django.db import models
from django.utils import timezone
from datetime import timedelta


class OTPCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    @classmethod
    def create_for(cls, email):
        # invalidate any previous unused OTPs for this email
        cls.objects.filter(email=email, is_used=False).update(is_used=True)

        return cls.objects.create(
            email=email,
            code="000000",  # overridden in production
            expires_at=timezone.now() + timedelta(minutes=5)
        )

    def __str__(self):
        return f"{self.email} — {self.code}"
