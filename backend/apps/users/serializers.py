from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields =  ['id', 'email', 'first_name', 'last_name', 'full_name', 'credits', 'created_at']
        read_only_fields = ['id', 'credits', 'created_at']
        
    def get_full_name(self ,obj):
        return obj.full_name
        
class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only =True, required = True , validators =[validate_password])
    password2 = serializers.CharField(write_only =True , required = True)
    
    class Meta:
        model =User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2']
        
    # Validating the email
    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Invalid Email Format")
        
        if User.objects.filter(email =value).exists():
            raise serializers.ValidationError("User with this email already exists")
        
        return value
    def validate(self , attrs):
        if attrs['password']!= attrs['password2']:
            raise serializers.ValidationError({"password":"Password don't match"})
        
        return attrs
    def create(self , validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
    
class LoginSerializer(serializers.Serializer):
    """User login serializer"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        user = authenticate(request=self.context.get('request'), email=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        
        if not user.is_active:
            raise serializers.ValidationError("Account is disabled")
        
        refresh = RefreshToken.for_user(user)
        
        return {
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    
class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match"})
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    """Forgot password serializer"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password serializer"""
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match"})
        return attrs