from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "role", "school", "is_active"]
    list_filter = ["role", "school", "is_active"]
    search_fields = ["username", "email"]
    fieldsets = UserAdmin.fieldsets + (
        ("CampusAI", {"fields": ["role", "school", "phone"]}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("CampusAI", {"fields": ["role", "school", "phone"]}),
    )
