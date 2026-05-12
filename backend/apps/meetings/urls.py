# apps/meetings/urls.py

from django.urls import path
from .views import (
    MeetingListCreateView,
    MeetingDetailView,
    MeetingSummaryView,
    MeetingGenerateSummaryView,
    MeetingStatisticsView,
)

urlpatterns = [
   
    path('meetings/', MeetingListCreateView.as_view(), name='meeting-list-create'),
    path('meetings/<int:pk>/', MeetingDetailView.as_view(), name='meeting-detail'),
    path('meetings/<int:pk>/summary/', MeetingSummaryView.as_view(), name='meeting-summary'),
    path('meetings/<int:pk>/generate-summary/', MeetingGenerateSummaryView.as_view(), name='meeting-generate-summary'),
    path('meetings/statistics/', MeetingStatisticsView.as_view(), name='meeting-statistics'),
]