# Google OAuth2 Setup Guide

## Current Status
✅ **Authentication pages are styled and ready**
✅ **Email/password login works** (test with testuser@example.com / test123)
✅ **Google OAuth integration is configured** (needs real credentials)

## Setting Up Google OAuth2 Credentials

### Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing project

2. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Enable these APIs:
     - Google+ API (for basic profile)
     - Google Drive API (for file integration)
     - People API (for profile information)

3. **Create OAuth2 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Configure:
     - **Name**: Writing Center OAuth
     - **Authorized JavaScript origins**: 
       - `http://localhost:8000` (development)
       - `https://yourdomain.com` (production)
     - **Authorized redirect URIs**:
       - `http://localhost:8000/accounts/google/login/callback/` (development)
       - `https://yourdomain.com/accounts/google/login/callback/` (production)

4. **Get Credentials**
   - Copy the Client ID and Client Secret
   - Download the JSON file (optional, for backup)

### Step 2: Configure Django Application

1. **Update Django Admin**
   - Go to: http://localhost:8000/admin/
   - Login with: admin / admin123
   - Navigate to "Social Applications"
   - Click on the "Google OAuth2" app
   - Update:
     - **Client ID**: Paste your Google Client ID
     - **Secret key**: Paste your Google Client Secret
   - Save changes

2. **Alternative: Environment Variables** (Recommended for production)
   ```bash
   export GOOGLE_OAUTH2_CLIENT_ID="your-client-id-here"
   export GOOGLE_OAUTH2_CLIENT_SECRET="your-client-secret-here"
   ```

### Step 3: Test the Integration

1. **Test Email Login** (Already working)
   - Go to: http://localhost:8000/accounts/login/
   - Use: testuser@example.com / test123

2. **Test Google OAuth** (After setting up credentials)
   - Go to: http://localhost:8000/
   - Click "Continue with Google"
   - Should redirect to Google consent screen

## Security Considerations

### Development Environment
- Using `http://localhost:8000` is acceptable for development
- Google allows localhost for testing

### Production Environment  
- **MUST use HTTPS** - Google requires SSL for production
- Update redirect URIs to use `https://`
- Set proper domain in Django sites framework
- Use environment variables for credentials
- Consider using Google Cloud Secret Manager

## Features Available After Setup

### For Users
- **One-click Google sign-in** - No password required
- **Account linking** - Link existing accounts with Google
- **Profile import** - Name and email from Google account
- **Google Drive integration** - Import/export documents

### For Administrators  
- **User management** - View Google-authenticated users
- **Security** - OAuth2 provides secure authentication
- **No password resets** - Users can always use Google login

## Troubleshooting

### Common Issues

1. **"Error 400: redirect_uri_mismatch"**
   - Check redirect URIs in Google Cloud Console
   - Ensure exact match including trailing slashes

2. **"Error 403: access_blocked"**
   - App may need verification for production use
   - Check OAuth consent screen configuration

3. **"Social account authentication failed"**
   - Verify Client ID and Secret are correct
   - Check that APIs are enabled in Google Cloud

4. **"Site matching query does not exist"**
   - Update Django Sites configuration
   - Ensure SITE_ID = 1 in settings

### Debug Mode
- Check Django logs for detailed error messages
- Enable allauth debug logging:
  ```python
  LOGGING = {
      'loggers': {
          'allauth': {
              'level': 'DEBUG',
          },
      },
  }
  ```

## Current Test Accounts

### Email/Password
- **Email**: testuser@example.com
- **Password**: test123

### Admin Account
- **Username**: admin
- **Password**: admin123

## Production Deployment Notes

1. **Update settings.py** for production:
   ```python
   ALLOWED_HOSTS = ['yourdomain.com']
   DEBUG = False
   SECURE_SSL_REDIRECT = True
   ```

2. **Configure real domain** in Django admin:
   - Update Site domain to production URL
   - Update Google OAuth redirect URIs

3. **Environment security**:
   - Never commit real credentials to version control
   - Use secure environment variable management
   - Consider using Django-environ for settings

## Next Steps After OAuth Setup

1. **Test full authentication flow**
2. **Test Google Drive integration**
3. **Set up user onboarding flow**
4. **Configure email verification** (if needed)
5. **Set up production deployment**

The authentication system is now ready for both email/password and Google OAuth login!