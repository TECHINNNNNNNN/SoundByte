# Authentication System Test Checklist

## Fixed Issues ✅
1. **Auth middleware** - Added missing `next()` call
2. **Database query** - Fixed Prisma query syntax in refresh endpoint  
3. **OAuth security** - Tokens now in httpOnly cookies, not URL
4. **Cookie-based auth** - Both access & refresh tokens in cookies
5. **Token rotation** - Old refresh tokens invalidated on refresh
6. **Frontend alignment** - Removed localStorage, using cookies

## Architecture Changes
- **Frontend**: Uses cookies via `withCredentials: true`
- **Backend**: Sends both tokens as httpOnly cookies
- **Security**: sameSite protection, httpOnly flags

## Manual Testing Steps

### 1. Register Flow
- [ ] Register new user at `/register`
- [ ] Check cookies set (DevTools > Application > Cookies)
- [ ] Verify auto-redirect to dashboard
- [ ] Check `/api/auth/me` returns user

### 2. Login Flow  
- [ ] Logout then login with email/password
- [ ] Verify cookies are set
- [ ] Check dashboard access
- [ ] Verify API calls work

### 3. Token Refresh
- [ ] Wait 15+ minutes (or modify token expiry to 1m for testing)
- [ ] Make API call - should auto-refresh
- [ ] Check new accessToken cookie
- [ ] Verify old refresh token invalid

### 4. OAuth Flow (Google/GitHub)
- [ ] Click OAuth login button
- [ ] Complete OAuth flow
- [ ] Verify redirect to `/auth/callback?success=true`
- [ ] Check cookies are set
- [ ] Verify dashboard access

### 5. Logout
- [ ] Click logout
- [ ] Verify cookies cleared
- [ ] Check redirect to login
- [ ] Verify protected routes blocked

## Common Issues to Watch
- CORS errors → Check `withCredentials: true`
- Cookie not setting → Check sameSite & secure flags
- 401 loops → Check middleware `next()` call
- OAuth fails → Check callback URL configuration