# Google OAuth Consent Screen Setup Guide

## Exact Steps to Add Test Users

### Step 1: Navigate to OAuth Consent Screen
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (Writing Center)
3. **Navigate to**: `APIs & Services` → `OAuth consent screen` (in left sidebar)

### Step 2: Configure OAuth Consent Screen
You should see tabs like: `OAuth consent screen`, `Scopes`, `Test users`, `Summary`

#### On the "OAuth consent screen" tab:
- **User Type**: External ✅
- **Publishing status**: Testing ✅
- **App name**: Writing Center
- **User support email**: Your email
- **Developer contact**: Your email

#### On the "Test users" tab (THIS IS KEY!):
1. **Click "Test users" tab**
2. **Click "+ ADD USERS"**
3. **Add**: `pem9880@nyu.edu`
4. **Click "SAVE"**

### Step 3: Verify Test User Added
You should see `pem9880@nyu.edu` listed under "Test users" with status "Active"

## What's the Difference?

- **Audience**: Refers to who can use your app in general
- **Test users**: Specific emails that can test your app while it's in "Testing" status
- **OAuth consent screen**: The overall configuration for the consent flow

## The Critical Point
When your app is in "Testing" status (which it should be for development), ONLY users listed in "Test users" can authenticate. This is Google's security measure.

## After Adding Test User
1. **Wait 2-3 minutes** for Google to update
2. **Try in incognito/private browser** to clear any cached auth state
3. **Test at**: http://localhost:8000/
4. **Click "Continue with Google"**

## Still Getting Error 400?
If you still get `redirect_uri_mismatch` after adding test user, the issue is likely:
1. **Exact URL mismatch** in "Authorized redirect URIs"
2. **Missing JavaScript origins**

Let me know if you see the "Test users" tab and successfully added your email there!