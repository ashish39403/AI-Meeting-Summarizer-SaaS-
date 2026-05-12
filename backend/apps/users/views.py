from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    RegistrationSerializer, LoginSerializer, UserSerializer,
    ChangePasswordSerializer, ForgotPasswordSerializer
)
from rest_framework.permissions import AllowAny

User = get_user_model()


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from django.contrib.auth import get_user_model

from .serializers import (
    RegistrationSerializer,
    LoginSerializer,
    UserSerializer
)

User = get_user_model()


# ==========================================
# REGISTER VIEW
# ==========================================

class RegisterView(APIView):

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):

        serializer = RegistrationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            # Generate JWT Tokens
            refresh = RefreshToken.for_user(user)

            return Response(
    {
        "user": UserSerializer(user).data,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    },
    status=status.HTTP_201_CREATED
)


# ==========================================
# LOGIN VIEW
# ==========================================

class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=400
            )

        return Response(
            serializer.validated_data,
            status=200
        )
        
class LogoutView(APIView):
    """
    User Logout - Blacklists refresh token
 
    """
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """
 
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """
    Change Password

    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": "Wrong password"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    Forgot Password - Send reset link
    POST: /api/auth/forgot-password/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # TODO: Send email with reset link
        # For now, just return success
        
        return Response({"message": "Password reset link sent to email"}, status=status.HTTP_200_OK)