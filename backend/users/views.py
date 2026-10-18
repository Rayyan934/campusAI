from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer


class IsCompanyAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "company_admin"


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsCompanyAdmin]

    def get_queryset(self):
        school_id = self.request.query_params.get("school_id")
        if school_id:
            return User.objects.filter(school_id=school_id)
        return User.objects.all()
