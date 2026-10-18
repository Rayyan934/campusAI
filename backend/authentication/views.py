from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from .models import OTPCode
from .otp import generate_otp, send_otp_email


@api_view(["POST"])
@permission_classes([AllowAny])
def request_otp(request):
    email = request.data.get("email", "").strip().lower()

    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    if not User.objects.filter(email=email).exists():
        return Response({"error": "No account found with this email."}, status=status.HTTP_404_NOT_FOUND)

    otp_code = generate_otp()
    otp = OTPCode.create_for(email)
    otp.code = otp_code
    otp.save()

    send_otp_email(email, otp_code)

    return Response({"message": "OTP sent successfully."})


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    email = request.data.get("email", "").strip().lower()
    code = request.data.get("otp", "").strip()

    if not email or not code:
        return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

    otp = OTPCode.objects.filter(email=email, code=code, is_used=False).last()

    if not otp or not otp.is_valid():
        return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

    otp.is_used = True
    otp.save()

    user = User.objects.get(email=email)
    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        "id": user.id,
        "name": user.get_full_name() or user.username,
        "email": user.email,
        "role": user.role,
        "school_id": user.school_id,
        "school_name": user.school.name if user.school else None,
        "ai_name": user.school.ai_name if user.school else "CampusAI",
    })
