#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://svqzggstrlifddamrlfb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cXpnZ3N0cmxpZmRkYW1ybGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjczNjcsImV4cCI6MjA3MjUwMzM2N30.pP98qP4EZz6HrgY6lZk9Un7nvPMbnAjKg3w4HXIV9FY
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Paystack Configuration (Add when ready)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here

# Email Service Configuration
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@shalean-cleaning.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Shalean Cleaning Services"
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
    fs.copyFileSync(envPath, envPath + '.backup');
  }

  // Write the new .env.local file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully!');
  console.log('📝 The file contains the Supabase credentials from your test-db.js file.');
  console.log('🚀 You can now restart your development server to see the services load properly.');
  
} catch (error) {
  console.error('❌ Error creating .env.local file:', error.message);
  console.log('\n📋 Please manually create a .env.local file in your project root with the following content:');
  console.log('\n' + envContent);
}
