# apps/summaries/services.py

import logging
from typing import Tuple, Optional, Dict, Any
from django.core.cache import cache
from apps.meetings.models import Meeting
from apps.credits.models import CreditTransaction
from .models import Summary
from .llm_client import MeetingSummarizer

logger = logging.getLogger(__name__)


class SummarizationService:
    """Service for handling meeting summarization business logic"""
    
    @staticmethod
    def generate_summary(meeting_id: int, user) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Generate summary for a meeting
        
        Returns:
            (success: bool, result: dict or None, message: str)
        """
        
        # Get meeting
        try:
            meeting = Meeting.objects.get(id=meeting_id, user=user)
        except Meeting.DoesNotExist:
            return False, None, "Meeting not found"
        
        # Validate status
        if meeting.status == Meeting.Status.PROCESSING:
            return False, None, "Summary already being generated"
        
        if meeting.status == Meeting.Status.COMPLETED and hasattr(meeting, 'summary'):
            return True, {'summary': meeting.summary.to_dict()}, "Summary already exists"
        
        # Update status to processing
        meeting.status = Meeting.Status.PROCESSING
        meeting.save(update_fields=['status', 'updated_at'])
        
        try:
            # Call LLM
            summarizer = MeetingSummarizer()
            result = summarizer.summarize_with_retry(meeting.transcript)
            
            if not result['success']:
                meeting.mark_as_failed(result.get('error', 'Unknown error'))
                return False, None, f"AI summarization failed: {result.get('error')}"
            
            # Create summary record
            summary_data = result['data']
            
            summary = Summary.objects.create(
                meeting=meeting,
                content=summary_data.get('summary', ''),
                short_summary=summary_data.get('short_summary', 
                    summary_data.get('summary', '')[:100]),
                decisions=summary_data.get('decisions', []),
                action_items=summary_data.get('action_items', []),
                key_points=summary_data.get('key_points', []),
                attendees=summary_data.get('attendees', []),
                sentiment_score=result.get('sentiment_score', 0.0),
                confidence_score=0.9,  # Default confidence
                model_used=result.get('model_used', 'gpt-3.5-turbo'),
                prompt_tokens=result.get('prompt_tokens', 0),
                completion_tokens=result.get('completion_tokens', 0),
                total_tokens=result.get('total_tokens', 0),
            )
            
            # Update meeting title if empty
            if not meeting.title:
                meeting.title = summary_data.get('short_summary', f"Meeting {meeting.id}")[:200]
            
            meeting.mark_as_complete()
            
            # Clear cache for this meeting
            cache.delete(f'meeting_summary_{meeting_id}')
            
            # Create credit usage transaction
            CreditTransaction.objects.create(
                user=user,
                amount=-1,
                balance_before=user.credits + 1,
                balance_after=user.credits,
                type=CreditTransaction.TransactionType.USAGE,
                reference_id=str(meeting.id),
                description=f"AI summary generation for meeting #{meeting.id}"
            )
            
            return True, {
                'meeting_id': meeting.id,
                'summary': summary.to_dict(),
                'tokens_used': result.get('total_tokens', 0),
                'duration_ms': result.get('duration_ms', 0),
                'cost': result.get('cost', 0),
            }, "Summary generated successfully"
            
        except Exception as e:
            logger.exception(f"Unexpected error in summarization: {str(e)}")
            meeting.mark_as_failed(str(e))
            return False, None, f"Unexpected error: {str(e)}"