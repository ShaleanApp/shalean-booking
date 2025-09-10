#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Supabase for Shalean Cleaning Services...\n');

// Check if Docker is running
try {
  execSync('docker ps', { stdio: 'ignore' });
  console.log('✅ Docker is running');
} catch (error) {
  console.log('❌ Docker is not running. Please start Docker Desktop and try again.');
  console.log('   Download from: https://docs.docker.com/desktop/');
  process.exit(1);
}

// Check if Supabase is already running
try {
  execSync('npx supabase@latest status', { stdio: 'ignore' });
  console.log('✅ Supabase is already running');
} catch (error) {
  console.log('🔄 Starting Supabase...');
  try {
    execSync('npx supabase@latest start', { stdio: 'inherit' });
    console.log('✅ Supabase started successfully');
  } catch (startError) {
    console.log('❌ Failed to start Supabase:', startError.message);
    process.exit(1);
  }
}

// Get Supabase status and extract credentials
try {
  const statusOutput = execSync('npx supabase@latest status', { encoding: 'utf8' });
  console.log('\n📊 Supabase Status:');
  console.log(statusOutput);
  
  // Extract credentials from status output
  const urlMatch = statusOutput.match(/API URL: (https?:\/\/[^\s]+)/);
  const anonKeyMatch = statusOutput.match(/anon key: ([a-zA-Z0-9._-]+)/);
  const serviceKeyMatch = statusOutput.match(/service_role key: ([a-zA-Z0-9._-]+)/);
  
  if (urlMatch && anonKeyMatch && serviceKeyMatch) {
    const envContent = `# Supabase Configuration (Local Development)
NEXT_PUBLIC_SUPABASE_URL=${urlMatch[1]}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKeyMatch[1]}
SUPABASE_SERVICE_ROLE_KEY=${serviceKeyMatch[1]}

# Paystack Configuration (Add your keys)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
PAYSTACK_SECRET_KEY=your_paystack_secret_key_here

# Email Service Configuration (Add your keys)
RESEND_API_KEY=your_resend_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Shalean Cleaning Services"
`;

    fs.writeFileSync('.env.local', envContent);
    console.log('\n✅ Created .env.local with Supabase credentials');
    console.log('📝 Please add your Paystack and email service keys to .env.local');
  }
} catch (error) {
  console.log('⚠️  Could not extract credentials automatically. Please check Supabase status manually.');
}

console.log('\n🎉 Setup complete! You can now:');
console.log('   1. Start the Next.js app: npm run dev');
console.log('   2. Open Supabase Studio: http://localhost:54323');
console.log('   3. View the database schema and data');
console.log('\n📚 For more information, see supabase/setup.md');
