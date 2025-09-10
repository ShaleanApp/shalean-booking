# Shalean Cleaning Services - Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Docker Desktop** (for local Supabase development)
3. **Git**

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase (Choose one option)

#### Option A: Local Development (Recommended)
```bash
# Make sure Docker Desktop is running
npx supabase@latest start

# This will start local Supabase and show you the credentials
# Copy the credentials to create .env.local file
```

#### Option B: Remote Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and API keys
3. Create `.env.local` file with your credentials

### 3. Create Environment File
Create `.env.local` in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Paystack Configuration (Add when ready)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here

# Email Service Configuration (Add when ready)
RESEND_API_KEY=your_resend_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Shalean Cleaning Services"
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Database Connection
Visit `http://localhost:3000/test-db` to verify the database is working correctly.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── test-db/           # Database test page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   └── database.ts       # Database service functions
└── types/                # TypeScript type definitions
    └── index.ts          # Database and app types
```

## Database Schema

The application uses 9 main tables:

1. **profiles** - User profiles with roles (customer, cleaner, admin)
2. **service_categories** - Cleaning service categories
3. **service_items** - Individual cleaning services
4. **service_extras** - Additional services and add-ons
5. **addresses** - User addresses
6. **bookings** - Cleaning appointments
7. **booking_services** - Services in each booking
8. **booking_extras** - Extras in each booking
9. **payments** - Payment records

## Features Implemented

### ✅ Task 1: Project Setup and Configuration
- Next.js 15 with TypeScript
- TailwindCSS v4
- shadcn/ui components
- Supabase integration
- Beautiful landing page

### ✅ Task 2: Supabase Database Schema Implementation
- Complete database schema with 9 tables
- Row Level Security (RLS) policies
- Seed data for services and categories
- Database utility functions
- User profile management

## Next Steps

The following tasks are ready to be implemented:

1. **Task 3**: Authentication System with Role-Based Access
2. **Task 4**: Shared UI System with shadcn/ui Components
3. **Task 5**: Service Management System (Admin)
4. **Task 6**: Customer Landing Page with SEO Optimization
5. **Task 7**: Multi-Step Booking Form with Guest Support

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Start Supabase local development
npx supabase@latest start

# Stop Supabase local development
npx supabase@latest stop

# Reset Supabase local database
npx supabase@latest db reset
```

## Troubleshooting

### Database Connection Issues
1. Make sure Docker Desktop is running (for local development)
2. Check your `.env.local` file has correct Supabase credentials
3. Visit `/test-db` to verify database connection

### Port Issues
- Next.js will automatically use the next available port if 3000 is busy
- Supabase uses ports 54321 (API), 54322 (DB), 54323 (Studio)

### Supabase Issues
- Check Supabase status: `npx supabase@latest status`
- View logs: `npx supabase@latest logs`
- Reset database: `npx supabase@latest db reset`
