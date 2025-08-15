# SoundByte - Your news, in bytes of sound

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm run prisma:generate  # Generate Prisma client
npm run dev              # Start server on port 3000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev              # Start dev server on port 5173
```

## Project Structure

### Authentication Flow
- **Cookie-based authentication** with httpOnly cookies
- **JWT tokens**: Access (15min) + Refresh (7days)
- **Automatic token refresh** on 401 responses
- **OAuth support** for Google and GitHub

### Routes
- `/` - Landing page (redirects to dashboard if authenticated)
- `/login` - Login page with OAuth options
- `/register` - Registration page
- `/dashboard` - Protected main dashboard
- `/profile` - Protected user profile page
- `/auth/callback` - OAuth callback handler

### Key Features
- ✅ Secure cookie-based authentication
- ✅ Automatic token refresh with rotation
- ✅ OAuth integration (Google/GitHub)
- ✅ Protected routes
- ✅ Responsive UI with Tailwind CSS
- ✅ PostgreSQL with Prisma ORM

## Environment Variables

### Backend (.env)
```
DATABASE_URL="your-database-url"
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
CLIENT_URL="http://localhost:5173"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Testing Authentication
1. Register a new account
2. Check cookies in DevTools (Application > Cookies)
3. Navigate to protected routes
4. Test logout functionality
5. Test OAuth login (requires OAuth credentials)

## Development
- Backend auto-restarts with nodemon
- Frontend hot-reloads with Vite
- Database GUI: `npm run prisma:studio`