# Simplified Authentication System

## Overview
This is a simplified authentication system using NextAuth.js with email/password credentials only. The system provides basic authentication functionality without the complexity of multiple providers or unnecessary dependencies.

## Features
- Email and password authentication
- JWT-based sessions
- Protected routes via middleware
- User registration and login

## Environment Variables
The following environment variables are required:

```
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-at-least-32-chars

# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/your-database"
```

## Authentication Flow
1. Users register with email, password, and name
2. Registration data is stored in the database with hashed passwords
3. Users can log in with email and password
4. NextAuth.js creates a JWT session token
5. Protected routes check for valid session via middleware

## Files
- `/auth.ts` - Main NextAuth.js configuration
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth.js API routes
- `/app/api/auth/register/route.ts` - User registration endpoint
- `/app/auth/login/page.tsx` - Login page
- `/app/auth/signup/page.tsx` - Registration page
- `/middleware.ts` - Route protection

## Database Schema
The authentication system uses Prisma with MongoDB. The relevant schema includes:

- User - Stores user information including hashed passwords
- Session - Manages user sessions
- VerificationToken - For email verification (if implemented)