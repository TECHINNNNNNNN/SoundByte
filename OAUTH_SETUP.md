# OAuth Configuration Guide

## Google OAuth Setup

### 1. Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **APIs & Services** → **Credentials**
5. Create OAuth 2.0 Client ID (Web application)

### 2. Configure OAuth Consent Screen
- User Type: External
- App name: SoundByte
- User support email: your-email
- Developer contact: your-email

### 3. OAuth Client Settings

**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5173
https://your-production-domain.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/google/callback
https://your-production-domain.com/api/auth/google/callback
```

### 4. Copy Credentials
- Client ID: `517938297512-xxxxx.apps.googleusercontent.com`
- Client Secret: `GOCSPX-xxxxxxxxxxxxx` (NOT the same as Client ID!)

## GitHub OAuth Setup

### 1. Create GitHub OAuth App
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"

### 2. Configure OAuth App
- **Application name**: SoundByte
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`

For production, create a separate OAuth app with:
- **Homepage URL**: `https://your-domain.com`
- **Authorization callback URL**: `https://your-domain.com/api/auth/github/callback`

### 3. Copy Credentials
- Client ID: From OAuth App page
- Client Secret: Generate and copy immediately

## Environment Variables

### Development (.env)
```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="GOCSPX-your-actual-secret"  # ⚠️ NOT the same as Client ID

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Production (.env.production)
```env
# Use different OAuth apps for production
GOOGLE_CLIENT_ID="production-google-client-id"
GOOGLE_CLIENT_SECRET="production-google-secret"
GITHUB_CLIENT_ID="production-github-client-id"
GITHUB_CLIENT_SECRET="production-github-secret"
CLIENT_URL="https://your-domain.com"
```

## Testing OAuth

1. **Google OAuth Test**:
   - Click "Login with Google" on login page
   - Should redirect to Google consent screen
   - After consent, redirects to `http://localhost:3000/api/auth/google/callback`
   - Then redirects to `http://localhost:5173/auth/callback?success=true`
   - Dashboard should load with user info

2. **GitHub OAuth Test**:
   - Click "Login with GitHub" on login page
   - Should redirect to GitHub authorization
   - After authorization, same flow as Google

## Common Issues

### "Redirect URI mismatch"
- Check exact URL match (including http/https, port, trailing slashes)
- Wait 5-10 minutes after adding URLs (Google caches)

### "Invalid client secret"
- Make sure you're using the actual secret, not the Client ID
- Regenerate secret if needed

### Cookies not setting
- Check CORS configuration
- Ensure `withCredentials: true` in frontend
- Check sameSite cookie settings

## Production Deployment

When deploying to production:
1. Create separate OAuth apps for production
2. Update authorized URLs with your domain
3. Use environment-specific .env files
4. Update `CLIENT_URL` in backend
5. Set `NODE_ENV=production`
6. Use HTTPS for all production URLs