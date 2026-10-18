from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "school", "phone", "first_name", "last_name"]

    def create(self, validated_data):
        # set unusable password since users login via OTP
        user = User(**validated_data)
        user.set_unusable_password()
        user.save()
        return user
