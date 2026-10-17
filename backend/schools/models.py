from django.db import models


class School(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)  # e.g. "don-bosco", "dps-delhi"
    ai_name = models.CharField(max_length=100, default="CampusAI")  # e.g. "Bosco AI"
    primary_color = models.CharField(max_length=7, default="#4F46E5")  # hex color
    logo_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
