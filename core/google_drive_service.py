"""
Google Drive API integration service for Writing Center
"""

import io
import json
from typing import Optional, List, Dict, Any
from django.conf import settings
from django.contrib.auth.models import User
from allauth.socialaccount.models import SocialToken, SocialApp
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload, MediaIoBaseUpload
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
import logging

logger = logging.getLogger(__name__)


class GoogleDriveService:
    """Service for interacting with Google Drive API."""
    
    def __init__(self, user: User):
        self.user = user
        self.service = None
        self.credentials = None
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Google Drive service with user credentials."""
        try:
            # Get Google social token for the user
            google_app = SocialApp.objects.get(provider='google')
            social_token = SocialToken.objects.get(
                app=google_app,
                account__user=self.user
            )
            
            # Create credentials from token
            self.credentials = Credentials(
                token=social_token.token,
                refresh_token=social_token.token_secret,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=google_app.client_id,
                client_secret=google_app.secret,
                scopes=[
                    'https://www.googleapis.com/auth/drive.file',
                    'https://www.googleapis.com/auth/drive',
                ]
            )
            
            # Refresh token if needed
            if self.credentials.expired:
                self.credentials.refresh(Request())
                # Update token in database
                social_token.token = self.credentials.token
                social_token.save()
            
            # Build the service
            self.service = build('drive', 'v3', credentials=self.credentials)
            
        except Exception as e:
            logger.error(f"Failed to initialize Google Drive service for user {self.user.id}: {e}")
            raise
    
    def create_folder(self, name: str, parent_id: Optional[str] = None) -> Optional[str]:
        """Create a folder in Google Drive."""
        try:
            file_metadata = {
                'name': name,
                'mimeType': 'application/vnd.google-apps.folder'
            }
            
            if parent_id:
                file_metadata['parents'] = [parent_id]
            
            folder = self.service.files().create(body=file_metadata, fields='id').execute()
            return folder.get('id')
            
        except Exception as e:
            logger.error(f"Failed to create folder {name}: {e}")
            return None
    
    def upload_document(self, title: str, content: str, folder_id: Optional[str] = None) -> Optional[str]:
        """Upload a document to Google Drive as a Google Doc."""
        try:
            file_metadata = {
                'name': title,
                'mimeType': 'application/vnd.google-apps.document'
            }
            
            if folder_id:
                file_metadata['parents'] = [folder_id]
            
            # Convert HTML content to plain text for Google Docs
            import html
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            plain_text = soup.get_text()
            
            media = MediaIoBaseUpload(
                io.BytesIO(plain_text.encode('utf-8')),
                mimetype='text/plain',
                resumable=True
            )
            
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()
            
            return file.get('id')
            
        except Exception as e:
            logger.error(f"Failed to upload document {title}: {e}")
            return None
    
    def download_document(self, file_id: str) -> Optional[str]:
        """Download a document from Google Drive."""
        try:
            # Export Google Doc as plain text
            request = self.service.files().export_media(
                fileId=file_id,
                mimeType='text/plain'
            )
            
            file_io = io.BytesIO()
            downloader = MediaIoBaseDownload(file_io, request)
            
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            content = file_io.getvalue().decode('utf-8')
            return content
            
        except Exception as e:
            logger.error(f"Failed to download document {file_id}: {e}")
            return None
    
    def update_document(self, file_id: str, content: str) -> bool:
        """Update an existing document in Google Drive."""
        try:
            # Convert HTML content to plain text
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            plain_text = soup.get_text()
            
            media = MediaIoBaseUpload(
                io.BytesIO(plain_text.encode('utf-8')),
                mimetype='text/plain',
                resumable=True
            )
            
            self.service.files().update(
                fileId=file_id,
                media_body=media
            ).execute()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update document {file_id}: {e}")
            return False
    
    def list_documents(self, folder_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List documents in Google Drive."""
        try:
            # Include multiple document types
            mime_types = [
                "mimeType='application/vnd.google-apps.document'",  # Google Docs
                "mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",  # .docx
                "mimeType='application/msword'",  # .doc
                "mimeType='text/plain'",  # .txt
                "mimeType='application/pdf'",  # .pdf
                "mimeType='text/rtf'",  # .rtf
            ]
            
            query = "(" + " or ".join(mime_types) + ")"
            if folder_id:
                query += f" and parents in '{folder_id}'"
            
            results = self.service.files().list(
                q=query,
                spaces='drive',
                fields='files(id, name, modifiedTime, createdTime, mimeType, size)'
            ).execute()
            
            return results.get('files', [])
            
        except Exception as e:
            logger.error(f"Failed to list documents: {e}")
            return []
    
    def delete_document(self, file_id: str) -> bool:
        """Delete a document from Google Drive."""
        try:
            self.service.files().delete(fileId=file_id).execute()
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete document {file_id}: {e}")
            return False
    
    def get_file_info(self, file_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a file."""
        try:
            file_info = self.service.files().get(
                fileId=file_id,
                fields='id, name, mimeType, modifiedTime, createdTime, size'
            ).execute()
            
            return file_info
            
        except Exception as e:
            logger.error(f"Failed to get file info for {file_id}: {e}")
            return None
    
    def share_document(self, file_id: str, email: str, role: str = 'reader') -> bool:
        """Share a document with another user."""
        try:
            permission = {
                'type': 'user',
                'role': role,
                'emailAddress': email
            }
            
            self.service.permissions().create(
                fileId=file_id,
                body=permission,
                sendNotificationEmail=True
            ).execute()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to share document {file_id} with {email}: {e}")
            return False


def get_or_create_writing_center_folder(user: User) -> Optional[str]:
    """Get or create the Writing Center folder in user's Google Drive."""
    try:
        drive_service = GoogleDriveService(user)
        
        # Check if folder already exists
        from .models import UserSettings
        settings, created = UserSettings.objects.get_or_create(user=user)
        
        if settings.google_drive_folder_id:
            # Verify the folder still exists
            folder_info = drive_service.get_file_info(settings.google_drive_folder_id)
            if folder_info:
                return settings.google_drive_folder_id
        
        # Create new folder
        folder_id = drive_service.create_folder('Writing Center Documents')
        if folder_id:
            settings.google_drive_folder_id = folder_id
            settings.save()
            return folder_id
        
        return None
        
    except Exception as e:
        logger.error(f"Failed to get/create Writing Center folder for user {user.id}: {e}")
        return None