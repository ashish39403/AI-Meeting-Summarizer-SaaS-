# apps/meetings/serializers.py

from rest_framework import serializers
from .models import Meeting

class MeetingSerializer(serializers.ModelSerializer):
    """Meeting Serializer - data convert karne ke liye"""
    
    # Read-only fields (API se automatically set honge)
    user_email = serializers.SerializerMethodField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Meeting
        fields = [
            'id', 'user_email', 'title', 'transcript', 'duration_minutes',
            'word_count', 'status', 'status_display', 'error_message',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_email', 'word_count', 'status', 
                           'error_message', 'created_at', 'updated_at']
    
    def get_user_email(self, obj):
        """User ki email return karega"""
        return obj.user.email
    
    def validate_title(self, value):
        """Title validation"""
        if value and len(value) > 200:
            raise serializers.ValidationError("Title too long (max 200 characters)")
        return value
    
    def validate_transcript(self, value):
        """Transcript validation - important!"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Transcript must be at least 10 characters")
        if len(value) > 50000:
            raise serializers.ValidationError("Transcript too long (max 50,000 characters)")
        return value.strip()
    
    def validate_duration_minutes(self, value):
        """Duration validation"""
        if value and (value < 1 or value > 480):
            raise serializers.ValidationError("Duration must be between 1 and 480 minutes")
        return value
    
    def create(self, validated_data):
        """Create meeting - current user set karega"""
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = Meeting.Status.PENDING
        return super().create(validated_data)


class MeetingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list view (less data)"""
    
    class Meta:
        model = Meeting
        fields ='__all__'
        read_only_fields = ['id', 'title', 'status', 'word_count', 'created_at']