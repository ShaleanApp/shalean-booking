#!/usr/bin/env node

const { Resend } = require('resend');

// Get API key from environment or command line argument
const apiKey = process.env.RESEND_API_KEY || process.argv[2];

const resend = new Resend(apiKey);

async function testEmail() {
  try {
    console.log('Testing email functionality...');
    console.log('RESEND_API_KEY:', apiKey ? 'Set' : 'Not set');
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'Not set');

    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not found in environment variables or command line arguments');
      console.log('Please provide your Resend API key as an environment variable or command line argument');
      console.log('Usage: npm run test-email -- your_api_key_here');
      return;
    }

    const { data, error } = await resend.emails.send({
      from: 'Shalean Cleaning Services <onboarding@resend.dev>', // Use Resend's default domain for testing
      to: ['info@shalean.com'], // Send to your verified email address
      subject: 'Test Email from Shalean Cleaning Services',
      html: '<h1>Test Email</h1><p>This is a test email to verify the Resend integration is working.</p>',
    });

    if (error) {
      console.error('❌ Error sending test email:', error);
    } else {
      console.log('✅ Email API connection successful!');
      console.log('Message ID:', data?.id);
    }
  } catch (error) {
    console.error('❌ Error testing email:', error);
  }
}

testEmail();
