from django.db import models
from django.utils import timezone
from django.core.validators import MinLengthValidator

from core import settings
# Create your models here

class Meeting(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed' 
    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        
    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meetings",
        db_index=True,
        help_text="User who owns this meeting"
    )
    title = models.CharField(
        max_length=150,
        blank=True,
        help_text="Auto-generated or user-provided title"
    )
    transcript = models.TextField(
        validators= [MinLengthValidator(10)],
        help_text="Raw meeting transcript text"
    )
    # Metadata
    duration_minutes = models.IntegerField(
        null=True,
        blank=True,
        help_text="Meeting duration in minutes"
    )
    word_count = models.IntegerField(
        null=True,
        blank=True,
        help_text="Total words in transcript"
    )
    #Tracking the meeting status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
        help_text="Current proccesing status"
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
        help_text="Processing priority"
    )
    
    # Error Tracking
    error_message = models.TextField(
        blank=True,
        help_text="Error message if status is FAILED"
    )
    retry_count = models.IntegerField(
        default=0,
        help_text="Number of retry attempts"
    )
    
    created_at = models.DateTimeField(
        default=timezone.now(),
        db_index=True,
        help_text="When meeting was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last update timestamp"
    )
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When summarization completed"
    )
    class Meta:
        ordering = ['-created_at']
        db_table = 'meetings'
        verbose_name = 'Meeting'
        verbose_name_plural = 'Meetings'
        indexes = [
            models.Index(fields=['user', '-created_at'], name='idx_user_meetings'),
            models.Index(fields=['status'], name='idx_meeting_status'),
            models.Index(fields=['created_at'], name='idx_meeting_created'),
        ]
    def __str__(self):
        return self.title or f"Meeting{self.id}"
    
    def save(self ,*args , **kwargs):
        if self.transcript and not self.word_count:
            self.word_count = len(self.transcript.split())
        super().save(*args , **kwargs)
    
    def mark_as_processing(self):
        self.status = self.Status.PROCESSING
        self.save(update_fields = ['status', 'updated_at'])
    def mark_as_complete(self):
        self.status = self.Status.COMPLETED
        self.save(update_fields=['status', 'processed_at', 'updated_at'])
        
    def mark_as_failed(self , error):
        self.status =self.Status.FAILED
        self.error_message = str(error)[:500]
        self.retry_count +=1
        self.save(update_fields=['status', 'error_message', 'retry_count', 'updated_at'])
        
    def can_retry(self):
        return self.status == self.Status.FAILED and self.retry_count <3