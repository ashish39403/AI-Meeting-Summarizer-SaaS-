from django.db import models
from django.contrib.auth.models import AbstractBaseUser , BaseUserManager , PermissionsMixin
from django.utils import timezone
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
# Create your models here.


# How a user will get created in a database
class UserManager(BaseUserManager):
    # Custom user manager for email authentication.
    def create_user(self , email , password =None , **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email =self.normalize_email(email)
        
        try:
            validate_email(email)
        except ValidationError:
            raise ValueError("Invalid email address")
        # Creating the user
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using =self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        return self.create_user(email, password, **extra_fields)
    
        
class User(AbstractBaseUser , PermissionsMixin):
    "Custom user model"
    email = models.EmailField(unique=True , db_index=True)
    first_name = models.CharField(max_length=223)
    last_name = models.CharField(max_length=223)
    # Credit system
    credits = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_ait = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True , blank=True)
    
    objects = UserManager()
    
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email
    
   

    def deduct_credit(self, amount=1, reference_id="", description=""):
        """Atomic credit deduction with transaction logging"""
        from apps.credits.models import CreditTransaction
        
        if self.credits >= amount:
            transaction = CreditTransaction.objects.create(
                user=self,
                amount=-amount,
                balance_before=self.credits,
                balance_after=self.credits - amount,
                type=CreditTransaction.TransactionType.USAGE,
                reference_id=reference_id,
                description=description or f"Used {amount} credits"
            )
            self.credits -= amount
            self.save(update_fields=['credits', 'updated_at'])
            return True, transaction
        return False, None
    
    def add_credits(self, amount, transaction_type, reference_id="", description=""):
        """Add credits with transaction logging"""
        from apps.credits.models import CreditTransaction
        
        transaction = CreditTransaction.objects.create(
            user=self,
            amount=amount,
            balance_before=self.credits,
            balance_after=self.credits + amount,
            type=transaction_type,
            reference_id=reference_id,
            description=description
        )
        self.credits += amount
        self.save(update_fields=['credits', 'updated_at'])
        return transaction
        