from django.contrib import admin
from .models import OTPCode


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    list_display = ["email", "code", "expires_at", "is_used", "created_at"]
    list_filter = ["is_used"]
    search_fields = ["email"]
