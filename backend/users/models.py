from django.contrib.auth.models import AbstractUser
from django.db import models
from schools.models import School


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        TEACHER = "teacher", "Teacher"
        PRINCIPAL = "principal", "Principal"
        OFFICE = "office", "Office Staff"
        PARENT = "parent", "Parent"

    school = models.ForeignKey(School, on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices)
    phone = models.CharField(max_length=15, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role}) — {self.school}"
