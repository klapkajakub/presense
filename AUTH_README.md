# Authentication System

This project includes a complete authentication system powered by NextAuth.js with the following features:

- Email/password authentication
- OAuth providers (Google, GitHub)
- User profile management
- Protected routes
- Password hashing with bcrypt
- MongoDB database storage using Prisma

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in the required environment variables:

```bash
cp .env.local.example .env.local
```

2. Update the MongoDB connection string with your database credentials.

3. Generate a random string for `NEXTAUTH_SECRET` (at least 32 characters):

```bash
openssl rand -base64 32
```

4. Set up OAuth providers (optional):
   - Create a Google project in the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a GitHub OAuth App in [GitHub Developer Settings](https://github.com/settings/developers)
   - Add the callback URLs (e.g., `http://localhost:3000/api/auth/callback/google`)

5. Set up the database schema:

```bash
npx prisma db push
```

## Routes

The following routes are included:

- `/auth/login` - Login page
- `/auth/signup` - Registration page
- `/auth/error` - Error page for authentication issues
- `/settings` - User profile and account settings

API endpoints:
- `/api/auth/[...nextauth]` - NextAuth.js API routes
- `/api/auth/register` - User registration
- `/api/user/profile` - Update user profile

## Protected Routes

All routes except the following are protected and require authentication:
- `/`
- `/auth/login`
- `/auth/signup`
- `/auth/error`
- `/auth/verify-request`

Protected routes will redirect unauthenticated users to the login page.

## Components

Key components:
- `UserAvatar` - Displays user avatar with fallback to initials
- Login and signup forms with validation
- Settings page with profile management

## Authentication Flow

1. User registers or signs in through the login page
2. NextAuth.js creates a session
3. Protected routes check for valid session via middleware
4. User can manage profile and sign out in the settings page

## Customization

- OAuth providers can be added or removed in `app/api/auth/[...nextauth]/route.ts`
- Additional user fields can be added to the Prisma schema
- Styling can be customized using Tailwind CSS classes 