from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json


class Document(models.Model):
    """Main document model representing writing documents."""
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title


class KeyTerm(models.Model):
    """Key terms associated with documents."""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='key_terms')
    term = models.CharField(max_length=255)
    definition = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ['document', 'term']
    
    def __str__(self):
        return f"{self.term} ({self.document.title})"


class MetaAnalysis(models.Model):
    """Meta-analysis data for document paragraphs."""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='meta_analyses')
    paragraph_index = models.IntegerField()
    says_content = models.TextField(blank=True)  # What the paragraph says
    does_content = models.TextField(blank=True)  # What the paragraph does
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['document', 'paragraph_index']
        ordering = ['paragraph_index']
    
    def __str__(self):
        return f"Meta-analysis for {self.document.title} - Para {self.paragraph_index}"


class Annotation(models.Model):
    """Annotations for documents."""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='annotations')
    annotation_id = models.CharField(max_length=50)
    content = models.TextField()
    paragraph_index = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['document', 'annotation_id']
    
    def __str__(self):
        return f"Annotation {self.annotation_id} for {self.document.title}"


class Reflection(models.Model):
    """Reflections associated with documents."""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='reflections')
    reflection_key = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['document', 'reflection_key']
    
    def __str__(self):
        return f"Reflection {self.reflection_key} for {self.document.title}"


class Source(models.Model):
    """Sources/references for documents."""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='sources')
    source_text = models.TextField()
    citation = models.TextField(blank=True)
    url = models.URLField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Source for {self.document.title}"


class PomodoroSession(models.Model):
    """Pomodoro timer sessions and tasks."""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='pomodoro_sessions')
    session_data = models.JSONField(default=dict)  # Store tasks, settings, etc.
    work_duration = models.IntegerField(default=25)  # minutes
    short_break_duration = models.IntegerField(default=5)  # minutes
    long_break_duration = models.IntegerField(default=15)  # minutes
    sessions_before_long_break = models.IntegerField(default=4)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Pomodoro session for {self.document.title}"


class UserSettings(models.Model):
    """User-specific settings and preferences."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='writing_settings')
    sidebar_collapsed = models.BooleanField(default=False)
    tutorial_completed = models.BooleanField(default=False)
    theme_preferences = models.JSONField(default=dict)
    google_drive_sync_enabled = models.BooleanField(default=False)
    google_drive_folder_id = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"Settings for {self.user.username}"


class GoogleDriveSync(models.Model):
    """Track Google Drive synchronization for documents."""
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='drive_sync')
    google_drive_file_id = models.CharField(max_length=255)
    last_synced_at = models.DateTimeField(auto_now=True)
    sync_status = models.CharField(max_length=20, choices=[
        ('synced', 'Synced'),
        ('pending', 'Pending'),
        ('error', 'Error'),
        ('conflict', 'Conflict')
    ], default='pending')
    error_message = models.TextField(blank=True)
    
    def __str__(self):
        return f"Drive sync for {self.document.title}"
