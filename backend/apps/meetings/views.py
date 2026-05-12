from django.shortcuts import render
from rest_framework.views import APIView
from .models import Meeting
from rest_framework import status , permissions
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q , Sum
from .serializers import MeetingListSerializer , MeetingSerializer
# Create your views here
#.

# API for creating meeting and getting meeting

class MeetingListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self ,request):
        queryset = Meeting.objects.filter(user= request.user)
        status_filter = request.query_params.get('status')
        
        if status_filter:
            queryset = queryset.filter(status= status_filter)
            
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(transcript__icontains=search)
            )
        queryset = queryset.order_by('-created_at')
        
        serializer = MeetingListSerializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    # Creating new meeting
    
    def post(self , request):
        serializer =MeetingSerializer(data= request.data , context ={'request':request})
        if serializer.is_valid():
            meeting = serializer.save()
            return Response(
                MeetingSerializer(meeting).data,
                status=status.HTTP_201_CREATED
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    # Detail api (read api)
class MeetingDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_meeting(self, pk, user):
      
        try:
            return Meeting.objects.get(pk=pk, user=user)
        except Meeting.DoesNotExist:
            return None
    

    def get(self, request, pk):
        meeting = self.get_meeting(pk, request.user)
        
        if not meeting:
            return Response(
                {"error": "Meeting not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = MeetingSerializer(meeting)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self , request ,pk):
        meeting = self.get_meeting(pk , request.user)
        if not meeting:
            return Response(
                {"error":"Meeting not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer =MeetingSerializer(meeting , data =request.data , partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self , request , pk):
        meeting = self.get_meeting(pk, request.user)
        
        if not meeting:
            return Response(
                {"error": "Meeting not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = MeetingSerializer(meeting, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        meeting = self.get_meeting(pk, request.user)
        
        if not meeting:
            return Response(
                {"error": "Meeting not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        meeting.delete()
        return Response(
            {"message": "Meeting deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
        

class MeetingSummaryView(APIView):
    """
    GET: Meeting ka summary dikhana
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """GET /api/meetings/{id}/summary/ - Get meeting summary"""
        
        try:
            meeting = Meeting.objects.get(pk=pk, user=request.user)
        except Meeting.DoesNotExist:
            return Response(
                {"error": "Meeting not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if summary exists
        if hasattr(meeting, 'summary'):
            from apps.summaries.serializers import SummarySerializer
            return Response(
                SummarySerializer(meeting.summary).data,
                status=status.HTTP_200_OK
            )
        
        return Response(
            {"error": "Summary not found. Use POST /api/meetings/{id}/generate-summary/ to create one."},
            status=status.HTTP_404_NOT_FOUND
        )


# apps/meetings/views.py - Update MeetingGenerateSummaryView

class MeetingGenerateSummaryView(APIView):
    """
    POST: Generate AI summary for a meeting (costs 1 credit)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        """POST /api/meetings/{id}/generate-summary/"""
        
        try:
            meeting = Meeting.objects.get(pk=pk, user=request.user)
        except Meeting.DoesNotExist:
            return Response(
                {"error": "Meeting not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user = request.user
        
        # Check if already processing
        if meeting.status == Meeting.Status.PROCESSING:
            return Response(
                {"error": "Summary already being generated. Please wait."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already completed
        if meeting.status == Meeting.Status.COMPLETED and hasattr(meeting, 'summary'):
            from apps.summaries.serializers import SummarySerializer
            return Response(
                {"message": "Summary already exists", "summary": SummarySerializer(meeting.summary).data},
                status=status.HTTP_200_OK
            )
        
        # Check credits
        if user.credits < 1:
            return Response(
                {"error": "Insufficient credits. Please purchase more.", 
                 "credits_remaining": user.credits},
                status=status.HTTP_402_PAYMENT_REQUIRED
            )
        
        # Deduct 1 credit
        user.credits -= 1
        user.save()
        
        # Generate summary using service
        from apps.summaries.services import SummarizationService
        success, result, message = SummarizationService.generate_summary(meeting.id, user)
        
        if success:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            # If failed, credit is already refunded in service
            return Response(
                {"error": message, "credits_remaining": user.credits},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MeetingStatisticsView(APIView):
    """
    GET: User ke saare meetings ke statistics
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """GET /api/meetings/statistics/ - Get user statistics"""
        
        user = request.user
        meetings = Meeting.objects.filter(user=user)
        
        # Calculate total words
        total_words = meetings.aggregate(total=Sum('word_count'))['total'] or 0
        
        # Calculate credits used
        from apps.credits.models import CreditTransaction
        credits_used = abs(sum(
            user.credit_transactions.filter(
                type=CreditTransaction.TransactionType.USAGE
            ).values_list('amount', flat=True)
        ))
        
        return Response({
            'total_meetings': meetings.count(),
            'completed_meetings': meetings.filter(status=Meeting.Status.COMPLETED).count(),
            'pending_meetings': meetings.filter(status=Meeting.Status.PENDING).count(),
            'processing_meetings': meetings.filter(status=Meeting.Status.PROCESSING).count(),
            'failed_meetings': meetings.filter(status=Meeting.Status.FAILED).count(),
            'total_words': total_words,
            'credits_remaining': user.credits,
            'credits_used': credits_used,
        }, status=status.HTTP_200_OK)