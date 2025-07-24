#!/usr/bin/env node
/**
 * NoseCone Setup Validation Script
 * 
 * This script validates that all modules can be imported correctly
 * and that the basic setup is working.
 */

import 'dotenv/config';

console.log('🚀 NoseCone Setup Validation\n');

const errors = [];
const warnings = [];

// Test module imports
console.log('📦 Testing module imports...');

try {
  const logger = (await import('../src/utils/logger.js')).default;
  console.log('  ✅ Logger module imported successfully');
} catch (error) {
  errors.push('Logger module import failed: ' + error.message);
  console.log('  ❌ Logger module import failed');
}

try {
  const configService = (await import('../src/services/configService.js')).default;
  console.log('  ✅ Config service imported successfully');
} catch (error) {
  errors.push('Config service import failed: ' + error.message);
  console.log('  ❌ Config service import failed');
}

try {
  const discordService = (await import('../src/services/discordService.js')).default;
  console.log('  ✅ Discord service imported successfully');
} catch (error) {
  errors.push('Discord service import failed: ' + error.message);
  console.log('  ❌ Discord service import failed');
}

try {
  const n8nService = (await import('../src/services/n8nService.js')).default;
  console.log('  ✅ N8n service imported successfully');
} catch (error) {
  errors.push('N8n service import failed: ' + error.message);
  console.log('  ❌ N8n service import failed');
}

try {
  const { commands } = await import('../src/commands/index.js');
  console.log(`  ✅ Command modules imported successfully (${commands.length} commands)`);
} catch (error) {
  errors.push('Command modules import failed: ' + error.message);  
  console.log('  ❌ Command modules import failed');
}

console.log('\n⚙️  Checking environment configuration...');

// Check required environment variables
const requiredEnvVars = [
  'DISCORD_BOT_TOKEN',
  'DISCORD_CLIENT_ID', 
  'N8N_WEBHOOK_URL'
];

const optionalEnvVars = [
  // 'DISCORD_CLIENT_SECRET', // No longer available in Discord Developer Portal
  'N8N_WEBHOOK_TOKEN',
  'N8N_SECONDARY_WEBHOOK',
  'BOT_PREFIX',
  'COMMAND_CHANNEL_ID',
  'DEBUG_MODE'
];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`  ✅ ${envVar} is configured`);
  } else {
    errors.push(`Required environment variable ${envVar} is not set`);
    console.log(`  ❌ ${envVar} is not configured (required)`);
  }
});

optionalEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`  ✅ ${envVar} is configured`);
  } else {
    warnings.push(`Optional environment variable ${envVar} is not set`);
    console.log(`  ⚠️  ${envVar} is not configured (optional)`);
  }
});

console.log('\n🔍 Environment variable validation...');

// Validate Discord bot token format (basic check)
if (process.env.DISCORD_BOT_TOKEN) {
  const tokenPattern = /^[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}$/;
  if (tokenPattern.test(process.env.DISCORD_BOT_TOKEN)) {
    console.log('  ✅ Discord bot token format appears valid');
  } else {
    warnings.push('Discord bot token format may be invalid');
    console.log('  ⚠️  Discord bot token format may be invalid');
  }
}

// Validate Discord client ID format (basic check)
if (process.env.DISCORD_CLIENT_ID) {
  const idPattern = /^\d{17,19}$/;
  if (idPattern.test(process.env.DISCORD_CLIENT_ID)) {
    console.log('  ✅ Discord client ID format appears valid');
  } else {
    warnings.push('Discord client ID format may be invalid');
    console.log('  ⚠️  Discord client ID format may be invalid');
  }
}

// Validate n8n webhook URL
if (process.env.N8N_WEBHOOK_URL) {
  try {
    new URL(process.env.N8N_WEBHOOK_URL);
    console.log('  ✅ N8n webhook URL format is valid');
  } catch {
    errors.push('N8n webhook URL format is invalid');
    console.log('  ❌ N8n webhook URL format is invalid');
  }
}

// Validate secondary webhook URL if provided
if (process.env.N8N_SECONDARY_WEBHOOK) {
  try {
    new URL(process.env.N8N_SECONDARY_WEBHOOK);
    console.log('  ✅ N8n secondary webhook URL format is valid');
  } catch {
    warnings.push('N8n secondary webhook URL format is invalid');
    console.log('  ⚠️  N8n secondary webhook URL format is invalid');
  }
}

console.log('\n📊 Validation Results:');
console.log('═'.repeat(50));

if (errors.length === 0) {
  console.log('🎉 Setup validation passed successfully!');
  console.log('\n✅ All required modules can be imported');
  console.log('✅ All required environment variables are configured');
  
  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} warning(s) found:`);
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
    console.log('\nThese warnings won\'t prevent the bot from running but may limit functionality.');
  }
  
  console.log('\n🚀 You can now start the bot with:');
  console.log('   npm start           (production mode)');
  console.log('   npm run dev         (development mode)');
  
} else {
  console.log('❌ Setup validation failed!');
  console.log(`\n${errors.length} error(s) found:`);
  errors.forEach((error, index) => {
    console.log(`   ${index + 1}. ${error}`);
  });
  
  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s) found:`);
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  console.log('\n🔧 Please fix the errors above before starting the bot.');
  console.log('📚 Check the setup guide: docs/SETUP.md');
  
  process.exit(1);
}

console.log('\n📚 For detailed setup instructions, see: docs/SETUP.md');
console.log('🆘 For troubleshooting help, see: docs/SETUP.md#troubleshooting'); 