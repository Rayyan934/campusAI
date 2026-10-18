from rest_framework import viewsets, permissions
from .models import School
from .serializers import SchoolSerializer


class IsCompanyAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "company_admin"


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsCompanyAdmin]
