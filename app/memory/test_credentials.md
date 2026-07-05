# PAHWA JEE — Admin Test Credentials

## Admin Account (seeded on startup)
- Email: `admin@pahwajee.com`
- Password: `Pahwa@2026`
- Role: `admin`

## Auth Endpoints
- POST `/api/auth/login`  → returns user + sets httpOnly cookies
- POST `/api/auth/logout` → clears cookies
- GET  `/api/auth/me`     → returns current authenticated user
- POST `/api/auth/refresh`→ refresh access token

## Admin Panel URL
- `/admin/login` (redirects to `/admin` on success)
