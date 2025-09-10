# Supabase Setup Instructions

## Prerequisites
1. Docker Desktop must be installed and running
2. Supabase CLI installed (already done with npx)

## Local Development Setup

### 1. Start Supabase Local Development
```bash
npx supabase@latest start
```

This will:
- Start local PostgreSQL database
- Start Supabase API server
- Start Supabase Studio (web interface)
- Apply all migrations and seed data

### 2. Get Local Credentials
After starting, you'll get:
- Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`
- API URL: `http://localhost:54321`
- Anon Key: (displayed in terminal)
- Service Role Key: (displayed in terminal)

### 3. Update Environment Variables
Create a `.env.local` file with the local credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Remote Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down the project URL and API keys

### 2. Link Local Project to Remote
```bash
npx supabase@latest link --project-ref your-project-ref
```

### 3. Push Migrations to Remote
```bash
npx supabase@latest db push
```

### 4. Update Environment Variables
Create a `.env.local` file with remote credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Database Schema

The database includes the following tables:
- `profiles` - User profiles with roles
- `service_categories` - Cleaning service categories
- `service_items` - Individual cleaning services
- `service_extras` - Additional services/extras
- `addresses` - User addresses
- `bookings` - Cleaning appointments
- `booking_services` - Services in each booking
- `booking_extras` - Extras in each booking
- `payments` - Payment records

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Admins can access all data
- Cleaners can access assigned bookings
- Public can view active services

## Seed Data

The database is seeded with:
- 4 service categories (Residential, Deep Cleaning, Move-in/out, Commercial)
- 17 service items with different pricing
- 15 service extras (add-ons)
