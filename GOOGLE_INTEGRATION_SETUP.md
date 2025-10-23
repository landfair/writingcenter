# Google Integration Setup Guide

## What We've Implemented

The Writing Center application now includes comprehensive Google integration:

### 1. Google OAuth2 Authentication
- **Sign in with Google** - Users can authenticate using their Google accounts
- **Automatic account creation** - New users are created automatically
- **Profile information** - User data is imported from Google

### 2. Google Drive API Integration
- **Document Export** - Export writing documents to Google Drive as Google Docs
- **Document Import** - Import Google Docs into the Writing Center
- **Auto-folder creation** - Creates "Writing Center Documents" folder in Drive
- **Document synchronization** - Keep documents in sync between platforms

## Features Implemented

### Frontend (JavaScript)
- Google Drive export/import buttons in toolbar
- Modal for selecting documents to import
- Drive sync status indicators
- Error handling and user notifications

### Backend (Django)
- Google OAuth2 configuration using django-allauth
- Google Drive API service wrapper
- Document import/export endpoints
- Sync status tracking models
- Error handling and logging

### Database Models
- `GoogleDriveSync` - Track synchronization status
- `UserSettings` - Google Drive preferences
- Extended user authentication support

## API Endpoints

### Authentication
- `/accounts/login/` - Login page with Google OAuth
- `/accounts/signup/` - Signup with Google option

### Google Drive API
- `POST /api/drive/export/` - Export document to Google Drive
- `POST /api/drive/import/` - Import document from Google Drive  
- `GET /api/drive/list/` - List user's Google Drive documents

## Setup Requirements

### Google Cloud Console Setup
1. Create a Google Cloud Project
2. Enable Google Drive API and Google+ API
3. Create OAuth2 credentials
4. Configure authorized redirect URIs
5. Add credentials to Django settings

### Environment Configuration
```python
# In settings.py or environment variables
GOOGLE_OAUTH2_CLIENT_ID = 'your-client-id'
GOOGLE_OAUTH2_CLIENT_SECRET = 'your-client-secret'
```

### Django Admin Setup
1. Go to Django admin (`/admin/`)
2. Add a Social Application for Google
3. Configure client ID and secret
4. Set up site domain

## Security Features

### Scopes Requested
- `profile` - Basic profile information
- `email` - Email address
- `https://www.googleapis.com/auth/drive.file` - Access to files created by the app
- `https://www.googleapis.com/auth/drive` - Full Drive access (for folder creation)

### Data Protection
- OAuth2 tokens are securely stored
- CSRF protection on all API endpoints
- User isolation (can only access own documents)
- Proper error handling without exposing sensitive data

## User Experience

### For New Users
1. Click "Sign up with Google"
2. Authorize Writing Center app
3. Automatic account creation
4. Welcome document created
5. Google Drive folder created automatically

### For Existing Users
1. Export documents to Google Drive with one click
2. Import existing Google Docs
3. Sync documents between platforms
4. Share documents via Google Drive sharing

## Technical Architecture

### Authentication Flow
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. User authorizes application
4. Google returns authorization code
5. Django exchanges code for access token
6. User account created/updated
7. Tokens stored for API access

### Drive Integration Flow
1. User initiates export/import
2. System checks for valid OAuth tokens
3. Refreshes tokens if needed
4. Calls Google Drive API
5. Creates/updates sync records
6. Provides user feedback

## Next Steps

### Production Deployment
1. Set up SSL/HTTPS (required for OAuth)
2. Configure production Google OAuth credentials
3. Set up proper domain in Google Cloud Console
4. Configure environment variables securely

### Enhanced Features
1. Real-time collaborative editing
2. Advanced sharing controls
3. Version history integration
4. Offline synchronization
5. Bulk import/export operations

## Troubleshooting

### Common Issues
- **JWT errors**: Ensure PyJWT is installed with crypto support
- **OAuth errors**: Check Google Cloud Console configuration
- **API errors**: Verify scopes and permissions
- **Import errors**: Check file permissions in Google Drive

### Debug Mode
The application includes comprehensive logging for debugging Google Drive integration issues.

## Benefits of This Implementation

### For Users
- Seamless integration with familiar Google tools
- No need to manage separate accounts
- Easy document sharing and collaboration
- Automatic backup to Google Drive

### For Institutions
- Single sign-on compatibility
- Reduced IT overhead
- Integration with existing Google Workspace
- Centralized document management

### For Developers
- Modular, maintainable code
- Proper error handling
- Scalable architecture
- Security best practices

This implementation transforms the Writing Center from a local tool into a cloud-integrated platform that works seamlessly with users' existing Google workflows.