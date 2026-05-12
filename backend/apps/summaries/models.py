# apps/summaries/models.py

from django.db import models
from django.utils import timezone
from apps.meetings.models import Meeting

class Summary(models.Model):
    """Production ready Summary model for AI-generated meeting summaries"""
    
    # Relationship (One-to-One with Meeting)
    meeting = models.OneToOneField(
        Meeting,
        on_delete=models.CASCADE,
        related_name='summary',
        help_text="Meeting this summary belongs to"
    )
    
    # Core Summary Content
    content = models.TextField(
        help_text="Main summary text (100-200 words)"
    )
    short_summary = models.TextField(
        blank=True,
        help_text="One-line summary for preview"
    )
    
    # Structured Data (JSON fields for flexibility)
    decisions = models.JSONField(
        default=list,
        help_text="List of decisions made in meeting"
    )
    action_items = models.JSONField(
        default=list,
        help_text="List of action items with owners"
    )
    key_points = models.JSONField(
        default=list,
        help_text="Key discussion points"
    )
    attendees = models.JSONField(
        default=list,
        blank=True,
        help_text="List of attendees mentioned"
    )
    
    # Analytics
    sentiment_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Sentiment score (-1 to 1)"
    )
    confidence_score = models.FloatField(
        null=True,
        blank=True,
        help_text="AI confidence score (0-1)"
    )
    
    # Model Info (for cost tracking)
    model_used = models.CharField(
        max_length=50,
        default='gpt-3.5-turbo',
        help_text="LLM model used"
    )
    prompt_tokens = models.IntegerField(
        default=0,
        help_text="Number of prompt tokens used"
    )
    completion_tokens = models.IntegerField(
        default=0,
        help_text="Number of completion tokens used"
    )
    total_tokens = models.IntegerField(
        default=0,
        help_text="Total tokens used"
    )
    
    # User Feedback
    is_helpful = models.BooleanField(
        null=True,
        blank=True,
        help_text="User feedback on summary quality"
    )
    user_rating = models.IntegerField(
        null=True,
        blank=True,
        choices=[(1, 'Poor'), (2, 'Fair'), (3, 'Good'), (4, 'Very Good'), (5, 'Excellent')],
        help_text="User rating (1-5)"
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When summary was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Last update timestamp"
    )
    regenerated_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Last time summary was regenerated"
    )
    
    class Meta:
        db_table = 'summaries'
        verbose_name = 'Summary'
        verbose_name_plural = 'Summaries'
        indexes = [
            models.Index(fields=['meeting'], name='idx_summary_meeting'),
            models.Index(fields=['created_at'], name='idx_summary_created'),
            models.Index(fields=['sentiment_score'], name='idx_summary_sentiment'),
        ]
    
    def __str__(self):
        return f"Summary for Meeting #{self.meeting.id}"
    
    def to_dict(self):
        """Convert to dictionary for API response"""
        return {
            'id': self.id,
            'content': self.content,
            'short_summary': self.short_summary,
            'decisions': self.decisions,
            'action_items': self.action_items,
            'key_points': self.key_points,
            'sentiment_score': self.sentiment_score,
            'created_at': self.created_at.isoformat(),
        }
    
    def regenerate(self):
        """Mark summary for regeneration"""
        self.regenerated_at = timezone.now()
        self.save(update_fields=['regenerated_at'])