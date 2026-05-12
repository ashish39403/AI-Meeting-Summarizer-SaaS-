# apps/credits/models.py

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class CreditTransaction(models.Model):
    """
    Production ready Credit Transaction model - Immutable ledger
    Every credit change is recorded here for audit trail
    """
    
    class TransactionType(models.TextChoices):
        PURCHASE = 'purchase', 'Purchase'
        USAGE = 'usage', 'Usage'
        BONUS = 'bonus', 'Bonus'
        REFUND = 'refund', 'Refund'
        ADMIN_ADJUST = 'admin_adjust', 'Admin Adjust'
    
    class TransactionStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        REVERSED = 'reversed', 'Reversed'
    
    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='credit_transactions',
        db_index=True,
        help_text="User associated with this transaction"
    )
    
    # Transaction Details
    amount = models.IntegerField(
        validators=[MinValueValidator(-10000), MaxValueValidator(10000)],
        help_text="Credit amount (positive = credit, negative = debit)"
    )
    balance_before = models.IntegerField(
        help_text="User's credit balance before transaction"
    )
    balance_after = models.IntegerField(
        help_text="User's credit balance after transaction"
    )
    
    # Metadata
    type = models.CharField(
        max_length=20,
        choices=TransactionType.choices,
        db_index=True,
        help_text="Type of transaction"
    )
    status = models.CharField(
        max_length=20,
        choices=TransactionStatus.choices,
        default=TransactionStatus.COMPLETED,
        db_index=True,
        help_text="Transaction status"
    )
    
    # References
    reference_id = models.CharField(
        max_length=200,
        blank=True,
        db_index=True,
        help_text="Reference ID (meeting ID, Stripe session ID, etc.)"
    )
    description = models.TextField(
        blank=True,
        help_text="Human readable description"
    )
    
    # Payment Gateway Info
    payment_gateway = models.CharField(
        max_length=50,
        blank=True,
        choices=[('stripe', 'Stripe'), ('razorpay', 'Razorpay'), ('manual', 'Manual')],
        help_text="Payment gateway used"
    )
    payment_intent_id = models.CharField(
        max_length=200,
        blank=True,
        help_text="Stripe/Razorpay payment intent ID"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="When transaction was created"
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When transaction was completed"
    )
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'credit_transactions'
        verbose_name = 'Credit Transaction'
        verbose_name_plural = 'Credit Transactions'
        indexes = [
            models.Index(fields=['user', '-created_at'], name='idx_user_transactions'),
            models.Index(fields=['type'], name='idx_transaction_type'),
            models.Index(fields=['reference_id'], name='idx_transaction_reference'),
            models.Index(fields=['created_at'], name='idx_transaction_created'),
        ]
    
    def __str__(self):
        return f"{self.type}: {self.amount} credits - {self.user.email}"
    
    def save(self, *args, **kwargs):
        """Auto-calculate balance_before if not set and ensure immutability"""
        if not self.balance_before:
            last_transaction = CreditTransaction.objects.filter(
                user=self.user
            ).order_by('-created_at').first()
            self.balance_before = last_transaction.balance_after if last_transaction else self.user.credits - self.amount
            self.balance_after = self.balance_before + self.amount
        
        if self.status == self.TransactionStatus.COMPLETED and not self.completed_at:
            self.completed_at = timezone.now()
        
        # Ensure immutability
        if self.pk and self.status == self.TransactionStatus.COMPLETED:
            raise ValueError("Cannot modify completed transaction")
        
        super().save(*args, **kwargs)