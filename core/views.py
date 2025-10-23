from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Document, KeyTerm, MetaAnalysis, Annotation, Reflection, Source, PomodoroSession, UserSettings, GoogleDriveSync
from .google_drive_service import GoogleDriveService, get_or_create_writing_center_folder
import json
import uuid
import logging

logger = logging.getLogger(__name__)


def home(request):
    """Home page - redirect to editor."""
    if request.user.is_authenticated:
        # Get user's most recent document or create a new one
        latest_doc = Document.objects.filter(user=request.user).first()
        if latest_doc:
            return redirect('core:editor', document_id=latest_doc.id)
        else:
            # Create a new document for new users
            new_doc = Document.objects.create(
                id=str(uuid.uuid4()),
                title="Welcome Document",
                content="<p>Welcome to Writing Center! Start writing here...</p>",
                user=request.user
            )
            return redirect('core:editor', document_id=new_doc.id)
    else:
        return render(request, 'core/landing.html')


@login_required
def editor(request, document_id=None):
    """Main editor view."""
    user_documents = Document.objects.filter(user=request.user)
    
    if document_id:
        document = get_object_or_404(Document, id=document_id, user=request.user)
    else:
        # Create a new document if none specified
        document = Document.objects.create(
            id=str(uuid.uuid4()),
            title="Untitled Document",
            content="",
            user=request.user
        )
        return redirect('core:editor', document_id=document.id)
    
    return render(request, 'core/editor.html', {
        'document': document,
        'documents': user_documents,
    })


@login_required
@require_http_methods(["POST"])
def save_document(request):
    """API endpoint to save document content."""
    try:
        data = json.loads(request.body)
        document_id = data.get('document_id')
        content = data.get('content', '')
        title = data.get('title', 'Untitled Document')
        
        document = get_object_or_404(Document, id=document_id, user=request.user)
        document.content = content
        document.title = title
        document.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Document saved successfully',
            'updated_at': document.updated_at.isoformat()
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["POST"])
def create_document(request):
    """API endpoint to create a new document."""
    try:
        data = json.loads(request.body)
        title = data.get('title', 'Untitled Document')
        content = data.get('content', '')
        
        document = Document.objects.create(
            id=str(uuid.uuid4()),
            title=title,
            content=content,
            user=request.user
        )
        
        return JsonResponse({
            'success': True,
            'document_id': document.id,
            'redirect_url': f'/editor/{document.id}/'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
def get_documents(request):
    """API endpoint to get user's documents."""
    documents = Document.objects.filter(user=request.user)
    document_list = []
    
    for doc in documents:
        document_list.append({
            'id': doc.id,
            'title': doc.title,
            'created_at': doc.created_at.isoformat(),
            'updated_at': doc.updated_at.isoformat(),
        })
    
    return JsonResponse({
        'success': True,
        'documents': document_list
    })


@login_required
@require_http_methods(["POST"])
def save_key_terms(request):
    """API endpoint to save key terms for a document."""
    try:
        data = json.loads(request.body)
        document_id = data.get('document_id')
        terms = data.get('terms', [])
        
        document = get_object_or_404(Document, id=document_id, user=request.user)
        
        # Clear existing terms
        KeyTerm.objects.filter(document=document).delete()
        
        # Add new terms
        for term_data in terms:
            KeyTerm.objects.create(
                document=document,
                term=term_data.get('term', ''),
                definition=term_data.get('definition', '')
            )
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@login_required
@require_http_methods(["POST"])
def save_meta_analysis(request):
    """API endpoint to save meta-analysis data."""
    try:
        data = json.loads(request.body)
        document_id = data.get('document_id')
        paragraph_data = data.get('paragraph_data', {})
        
        document = get_object_or_404(Document, id=document_id, user=request.user)
        
        for index, content in paragraph_data.items():
            meta_analysis, created = MetaAnalysis.objects.get_or_create(
                document=document,
                paragraph_index=int(index),
                defaults={
                    'says_content': content.get('says', ''),
                    'does_content': content.get('does', '')
                }
            )
            if not created:
                meta_analysis.says_content = content.get('says', '')
                meta_analysis.does_content = content.get('does', '')
                meta_analysis.save()
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


# Google Drive Integration Views

@login_required
@require_http_methods(["POST"])
def export_to_drive(request):
    """Export a document to Google Drive."""
    try:
        data = json.loads(request.body)
        document_id = data.get('document_id')
        
        document = get_object_or_404(Document, id=document_id, user=request.user)
        
        # Initialize Google Drive service
        drive_service = GoogleDriveService(request.user)
        
        # Get or create Writing Center folder
        folder_id = get_or_create_writing_center_folder(request.user)
        
        # Upload document
        drive_file_id = drive_service.upload_document(
            title=document.title,
            content=document.content,
            folder_id=folder_id
        )
        
        if drive_file_id:
            # Create or update sync record
            sync_record, created = GoogleDriveSync.objects.get_or_create(
                document=document,
                defaults={'google_drive_file_id': drive_file_id, 'sync_status': 'synced'}
            )
            if not created:
                sync_record.google_drive_file_id = drive_file_id
                sync_record.sync_status = 'synced'
                sync_record.error_message = ''
                sync_record.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Document exported to Google Drive successfully',
                'drive_file_id': drive_file_id
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to upload to Google Drive'
            }, status=400)
            
    except Exception as e:
        logger.error(f"Drive export error for user {request.user.id}: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Google Drive export failed. Please ensure you have connected your Google account.'
        }, status=400)


@login_required
@require_http_methods(["POST"])
def import_from_drive(request):
    """Import a document from Google Drive."""
    try:
        data = json.loads(request.body)
        drive_file_id = data.get('drive_file_id')
        
        if not drive_file_id:
            return JsonResponse({
                'success': False,
                'error': 'Google Drive file ID is required'
            }, status=400)
        
        # Initialize Google Drive service
        drive_service = GoogleDriveService(request.user)
        
        # Get file info
        file_info = drive_service.get_file_info(drive_file_id)
        if not file_info:
            return JsonResponse({
                'success': False,
                'error': 'Could not access the specified Google Drive file'
            }, status=400)
        
        # Download content
        content = drive_service.download_document(drive_file_id)
        if content is None:
            return JsonResponse({
                'success': False,
                'error': 'Failed to download document content'
            }, status=400)
        
        # Create new document
        document = Document.objects.create(
            id=str(uuid.uuid4()),
            title=file_info.get('name', 'Imported Document'),
            content=f'<p>{content}</p>',  # Wrap in HTML paragraph
            user=request.user
        )
        
        # Create sync record
        GoogleDriveSync.objects.create(
            document=document,
            google_drive_file_id=drive_file_id,
            sync_status='synced'
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Document imported from Google Drive successfully',
            'document_id': document.id,
            'redirect_url': f'/editor/{document.id}/'
        })
        
    except Exception as e:
        logger.error(f"Drive import error for user {request.user.id}: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Google Drive import failed. Please ensure you have connected your Google account.'
        }, status=400)


@login_required
def list_drive_documents(request):
    """List user's documents in Google Drive."""
    try:
        drive_service = GoogleDriveService(request.user)
        folder_id = get_or_create_writing_center_folder(request.user)
        
        drive_documents = drive_service.list_documents(folder_id)
        
        return JsonResponse({
            'success': True,
            'documents': drive_documents
        })
        
    except Exception as e:
        logger.error(f"List drive documents error for user {request.user.id}: {e}")
        return JsonResponse({
            'success': False,
            'error': 'Failed to access Google Drive. Please ensure you have connected your Google account.'
        }, status=400)
