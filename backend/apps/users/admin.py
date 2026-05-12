# apps/users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """User model admin panel configuration"""
    
    # Admin panel mein dikhne wale fields
    list_display = ['id', 'email', 'first_name', 'last_name', 'credits', 'is_active', 'created_at']
    
    # Filter options
    list_filter = ['is_active', 'is_staff', 'created_at']
    
    # Search fields
    search_fields = ['email', 'first_name', 'last_name']
    
    # Sorting
    ordering = ['-created_at']
    
    # Edit kar sakte hain list se hi
    list_editable = ['credits', 'is_active']
    
    # User edit page layout
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Credits', {'fields': ('credits',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important Dates', {'fields': ('last_login', 'created_at')}),
    )
    
    # Add user page layout
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name'),
        }),
    )
    
    # Read-only fields
    readonly_fields = ['created_at']