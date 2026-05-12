# apps/summaries/serializers.py

from rest_framework import serializers
from .models import Summary


class SummarySerializer(serializers.ModelSerializer):

    
    # Read-only fields - user ko sirf dikhega, edit nahi kar sakta
    meeting_id = serializers.IntegerField(source='meeting.id', read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    # Human readable sentiment display
    sentiment_display = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Summary
        fields = [
            'id', 
            'meeting_id',          
            'content',              
            'short_summary',        
            'decisions',            
            'action_items',       
            'key_points',           
            'attendees',         
            'sentiment_score',     
            'sentiment_display',   
            'confidence_score',     
            'model_used',           
            'prompt_tokens',        
            'completion_tokens',    
            'total_tokens',        
            'is_helpful',           
            'user_rating',          
            'created_at',      
            'updated_at',          
        ]
        read_only_fields = [
            'id', 'meeting_id', 'created_at', 'updated_at', 
            'model_used', 'prompt_tokens', 'completion_tokens', 
            'total_tokens', 'confidence_score'
        ]
    
    def get_sentiment_display(self, obj):
        """Convert sentiment score to human readable text"""
        if obj.sentiment_score is None:
            return "Neutral"
        if obj.sentiment_score > 0.3:
            return "Positive"
        elif obj.sentiment_score < -0.3:
            return "Negative"
        return "Neutral"
    
    def validate_content(self, value):
        """Validate summary content"""
        if not value or len(value.strip()) < 20:
            raise serializers.ValidationError(
                "Summary content must be at least 20 characters"
            )
        if len(value) > 5000:
            raise serializers.ValidationError(
                "Summary content cannot exceed 5000 characters"
            )
        return value.strip()
    
    def validate_user_rating(self, value):
        """Validate user rating"""
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError(
                "Rating must be between 1 and 5"
            )
        return value


class SummaryCreateSerializer(serializers.Serializer):
    """
    For creating/updating summary manually (admin use)
    """
    meeting_id = serializers.IntegerField()
    content = serializers.CharField()
    decisions = serializers.ListField(
        child=serializers.CharField(), 
        default=list
    )
    action_items = serializers.ListField(
        child=serializers.CharField(), 
        default=list
    )
    key_points = serializers.ListField(
        child=serializers.CharField(), 
        default=list
    )
    sentiment_score = serializers.FloatField(required=False, allow_null=True)