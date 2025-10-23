from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('editor/', views.editor, name='editor_new'),
    path('editor/<str:document_id>/', views.editor, name='editor'),
    
    # API endpoints
    path('api/save-document/', views.save_document, name='save_document'),
    path('api/create-document/', views.create_document, name='create_document'),
    path('api/get-documents/', views.get_documents, name='get_documents'),
    path('api/save-key-terms/', views.save_key_terms, name='save_key_terms'),
    path('api/save-meta-analysis/', views.save_meta_analysis, name='save_meta_analysis'),
    
    # Google Drive API endpoints
    path('api/drive/export/', views.export_to_drive, name='export_to_drive'),
    path('api/drive/import/', views.import_from_drive, name='import_from_drive'),
    path('api/drive/list/', views.list_drive_documents, name='list_drive_documents'),
]