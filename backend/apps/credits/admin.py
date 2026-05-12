from django.contrib import admin
from .models import CreditTransaction

@admin.register(CreditTransaction)
class CreditTransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'balance_after', 'type', 'created_at']
    list_filter = ['type', 'status', 'created_at']
    search_fields = ['user__email', 'reference_id']
    readonly_fields = ['created_at', 'completed_at']