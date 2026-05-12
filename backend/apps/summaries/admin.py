from django.contrib import admin
from .models import Summary

@admin.register(Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ['id', 'meeting', 'sentiment_score', 'created_at']
    list_filter = ['created_at', 'model_used']
    search_fields = ['meeting__user__email']
    readonly_fields = ['created_at', 'updated_at']