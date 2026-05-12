from django.contrib import admin
from .models import Meeting

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'status', 'word_count', 'created_at']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['user__email', 'title']
    readonly_fields = ['created_at', 'updated_at', 'processed_at']
    raw_id_fields = ['user']