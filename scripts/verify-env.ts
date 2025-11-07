#!/usr/bin/env tsx
/**
 * Environment Variables Verification Script
 * 
 * This script verifies that all required environment variables are set
 * and validates their formats.
 * 
 * Usage: tsx scripts/verify-env.ts
 */

const requiredEnvVars = {
  // Required
  MONGODB_URI: {
    required: true,
    description: 'MongoDB connection string',
    validate: (value: string) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
  },
  NEXTAUTH_URL: {
    required: true,
    description: 'NextAuth.js URL (should match production domain)',
    validate: (value: string) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
      } catch {
        return false;
      }
    },
  },
  NEXTAUTH_SECRET: {
    required: true,
    description: 'NextAuth.js secret (should be 32+ characters)',
    validate: (value: string) => value.length >= 32,
  },
  CLOUDINARY_CLOUD_NAME: {
    required: true,
    description: 'Cloudinary cloud name',
    validate: (value: string) => value.length > 0,
  },
  CLOUDINARY_API_KEY: {
    required: true,
    description: 'Cloudinary API key',
    validate: (value: string) => value.length > 0,
  },
  CLOUDINARY_API_SECRET: {
    required: true,
    description: 'Cloudinary API secret',
    validate: (value: string) => value.length > 0,
  },
  
  // Optional but recommended
  SMTP_HOST: {
    required: false,
    description: 'SMTP server host (optional)',
    validate: () => true,
  },
  SMTP_PORT: {
    required: false,
    description: 'SMTP server port (optional)',
    validate: () => true,
  },
  GITHUB_PAT: {
    required: false,
    description: 'GitHub personal access token (optional)',
    validate: () => true,
  },
  VERCEL_TOKEN: {
    required: false,
    description: 'Vercel API token (optional)',
    validate: () => true,
  },
};

function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...\n');
  
  const results: Array<{ name: string; status: '✅' | '❌' | '⚠️'; message: string }> = [];
  let hasErrors = false;
  let hasWarnings = false;
  
  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];
    
    if (!value) {
      if (config.required) {
        results.push({
          name: key,
          status: '❌',
          message: `Missing (required): ${config.description}`,
        });
        hasErrors = true;
      } else {
        results.push({
          name: key,
          status: '⚠️',
          message: `Missing (optional): ${config.description}`,
        });
        hasWarnings = true;
      }
    } else {
      if (config.validate(value)) {
        // Mask sensitive values
        const displayValue = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')
          ? '*'.repeat(Math.min(value.length, 20))
          : value;
        results.push({
          name: key,
          status: '✅',
          message: `Set: ${displayValue}`,
        });
      } else {
        results.push({
          name: key,
          status: '❌',
          message: `Invalid format: ${config.description}`,
        });
        hasErrors = true;
      }
    }
  }
  
  // Print results
  for (const result of results) {
    console.log(`${result.status} ${result.name}: ${result.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (hasErrors) {
    console.log('\n❌ ERRORS FOUND: Some required environment variables are missing or invalid.');
    console.log('Please fix these issues before deploying.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  WARNINGS: Some optional environment variables are missing.');
    console.log('These are not required but may limit functionality.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All environment variables are set correctly!\n');
    process.exit(0);
  }
}

// Additional checks
function checkProductionSpecific() {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  
  if (isProduction) {
    console.log('\n🔒 Production-specific checks:');
    
    // Check NEXTAUTH_URL uses HTTPS
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (nextAuthUrl && !nextAuthUrl.startsWith('https://')) {
      console.log('⚠️  WARNING: NEXTAUTH_URL should use HTTPS in production');
    }
    
    // Check NEXTAUTH_SECRET is secure
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    if (nextAuthSecret && nextAuthSecret.length < 32) {
      console.log('⚠️  WARNING: NEXTAUTH_SECRET should be at least 32 characters');
    }
    
    // Check MongoDB URI is production
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri && mongoUri.includes('localhost')) {
      console.log('⚠️  WARNING: MONGODB_URI appears to be using localhost (use production database)');
    }
  }
}

// Run checks
checkEnvironmentVariables();
checkProductionSpecific();

