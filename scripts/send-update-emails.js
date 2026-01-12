#!/usr/bin/env node

/**
 * Script to send app update emails to all existing users
 * 
 * Usage: node scripts/send-update-emails.js
 * 
 * This script will:
 * 1. Connect to MongoDB
 * 2. Fetch all users from app_users collection
 * 3. Send email to each user with the new app download link
 * 4. Log progress and handle errors gracefully
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

// Configuration
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DB_NAME = 'CollaborativeSuccess';

// MailerSend configuration (same as Flask backend)
const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY || 'mlsn.93fc872cada5d7704dca58fd885cb56f2361e3e6bc945f786dada944aa56ad29';
const MAILERSEND_FROM_EMAIL = process.env.MAILERSEND_FROM_EMAIL || 'support@stratixctd.com';
const MAILERSEND_FROM_NAME = process.env.MAILERSEND_FROM_NAME || 'CollaborativeSuccess';

// New app download link
const NEW_APP_DOWNLOAD_LINK = 'https://expo.dev/artifacts/eas/4N9F7T1pNhTFRDCapePkPK.apk';

// Initialize MailerSend
const mailerSend = new MailerSend({ apiKey: MAILERSEND_API_KEY });

// AppUser model (same as in models/AppUser.js)
const appUserSchema = new mongoose.Schema({}, { 
  strict: false, 
  collection: 'app_users'
});
const AppUser = mongoose.model('AppUser', appUserSchema);

/**
 * Create HTML email template
 */
function createEmailHTML(userEmail) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      margin: 0; 
      padding: 0; 
      background-color: #f4f4f4;
    }
    .container { 
      max-width: 600px; 
      margin: 20px auto; 
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #5865F2 0%, #3C45A5 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content { 
      padding: 40px 30px; 
      background: #ffffff;
    }
    .content p {
      margin: 15px 0;
      color: #555;
    }
    .button { 
      display: inline-block; 
      background: #5865F2; 
      color: white; 
      padding: 16px 32px; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 30px 0; 
      font-weight: 600;
      font-size: 16px;
      transition: background 0.3s;
    }
    .button:hover {
      background: #4752C4;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .download-link {
      word-break: break-all;
      background: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #5865F2;
      margin: 20px 0;
      font-family: monospace;
      font-size: 14px;
      color: #5865F2;
    }
    .features {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .features h3 {
      margin-top: 0;
      color: #5865F2;
    }
    .features ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .features li {
      margin: 8px 0;
      color: #555;
    }
    .footer { 
      text-align: center; 
      padding: 30px;
      background: #f9fafb;
      color: #6b7280; 
      font-size: 13px; 
      border-top: 1px solid #e5e7eb;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 App Update Available!</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We're excited to announce that a new version of CollaborativeSuccess is now available with exciting new features and improvements!</p>
      
      <div class="features">
        <h3>✨ What's New:</h3>
        <ul>
          <li>Enhanced user experience with improved interface</li>
          <li>New features and functionality</li>
          <li>Performance improvements and bug fixes</li>
          <li>Better security and stability</li>
        </ul>
      </div>

      <p><strong>Please update your app to the latest version to access these new features.</strong></p>

      <div class="button-container">
        <a href="${NEW_APP_DOWNLOAD_LINK}" class="button">Download Updated App</a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <div class="download-link">${NEW_APP_DOWNLOAD_LINK}</div>

      <div class="warning">
        <strong>⚠️ Important:</strong> Make sure to download and install the new version to continue enjoying all features. The previous version may stop receiving updates.
      </div>

      <p>Thank you for being part of CollaborativeSuccess!</p>
      
      <p>Best regards,<br><strong>The CollaborativeSuccess Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Create plain text email template
 */
function createEmailText() {
  return `
App Update Available!

Hello,

We're excited to announce that a new version of CollaborativeSuccess is now available with exciting new features and improvements!

What's New:
- Enhanced user experience with improved interface
- New features and functionality
- Performance improvements and bug fixes
- Better security and stability

Please update your app to the latest version to access these new features.

Download the updated app here:
${NEW_APP_DOWNLOAD_LINK}

Important: Make sure to download and install the new version to continue enjoying all features. The previous version may stop receiving updates.

Thank you for being part of CollaborativeSuccess!

Best regards,
The CollaborativeSuccess Team

---
This is an automated message. Please do not reply to this email.
If you have any questions, please contact our support team.
  `.trim();
}

/**
 * Send email to a single user
 */
async function sendEmailToUser(user) {
  try {
    const email = user.email;
    
    if (!email || !email.trim()) {
      console.log(`⚠️  Skipping user ${user._id}: No email address`);
      return { success: false, reason: 'No email address' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      console.log(`⚠️  Skipping user ${user._id}: Invalid email format: ${email}`);
      return { success: false, reason: 'Invalid email format' };
    }

    const emailParams = new EmailParams()
      .setFrom(new Sender(MAILERSEND_FROM_EMAIL, MAILERSEND_FROM_NAME))
      .setTo([new Recipient(email.trim())])
      .setSubject('🚀 App Update Available - New Features Await!')
      .setHtml(createEmailHTML(email.trim()))
      .setText(createEmailText());

    const response = await mailerSend.email.send(emailParams);
    
    // Check if response indicates an error
    if (response && response.statusCode && response.statusCode >= 400) {
      const errorMsg = response.body?.message || response.body?.error || `HTTP ${response.statusCode}`;
      console.error(`❌ Failed to send email to ${email.trim()}: ${errorMsg}`);
      return { success: false, reason: errorMsg, statusCode: response.statusCode };
    }
    
    console.log(`✅ Email sent successfully to: ${email.trim()}`);
    return { success: true, email: email.trim() };
    
  } catch (error) {
    // Enhanced error handling to capture full error details
    let errorMessage = 'Unknown error';
    let errorDetails = {};
    
    // Try to extract error message from various possible locations
    if (error.message) {
      errorMessage = error.message;
    } else if (error.toString && error.toString() !== '[object Object]') {
      errorMessage = error.toString();
    }
    
    // Try to extract more details from error object
    if (error.response) {
      errorDetails.response = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
      errorMessage = error.response.data?.message || error.response.data?.error || error.response.statusText || errorMessage;
    }
    
    if (error.body) {
      errorDetails.body = error.body;
      errorMessage = error.body.message || error.body.error || errorMessage;
    }
    
    // Check for MailerSend specific error structure
    let statusCode = null;
    if (error.statusCode) {
      statusCode = error.statusCode;
      errorDetails.statusCode = error.statusCode;
      errorMessage = error.body?.message || error.message || `HTTP ${error.statusCode}`;
    } else if (error.response?.status) {
      statusCode = error.response.status;
      errorDetails.statusCode = error.response.status;
    }
    
    // Check for axios-style errors
    if (error.response?.data) {
      const responseData = error.response.data;
      errorMessage = responseData.message || responseData.error || responseData.errors || errorMessage;
      errorDetails.responseData = responseData;
    }
    
    // If we still don't have a meaningful error message, try to stringify the whole error
    if (!errorMessage || errorMessage === 'Unknown error') {
      try {
        // Try to get error properties
        const errorKeys = Object.keys(error);
        if (errorKeys.length > 0) {
          const errorInfo = {};
          errorKeys.forEach(key => {
            try {
              errorInfo[key] = error[key];
            } catch (e) {
              errorInfo[key] = '[unable to serialize]';
            }
          });
          const errorStr = JSON.stringify(errorInfo, null, 2);
          if (errorStr && errorStr !== '{}') {
            errorMessage = `Error details: ${errorStr.substring(0, 300)}`; // Limit length
          }
        }
      } catch (e) {
        errorMessage = `Error occurred (type: ${typeof error}, constructor: ${error?.constructor?.name || 'unknown'})`;
      }
    }
    
    // Ensure we always have a non-undefined error message
    if (!errorMessage || errorMessage.trim() === '') {
      errorMessage = 'Unknown error occurred';
    }
    
    // Log full error for debugging
    const fullError = errorMessage + (Object.keys(errorDetails).length > 0 ? ` | Details: ${JSON.stringify(errorDetails)}` : '');
    console.error(`❌ Failed to send email to ${user.email || user._id}: ${fullError}`);
    
    return { success: false, reason: errorMessage, details: errorDetails, statusCode: statusCode };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('📧 Starting app update email campaign...\n');
  console.log(`📱 New download link: ${NEW_APP_DOWNLOAD_LINK}\n`);

  // Check configuration
  if (!MAILERSEND_API_KEY) {
    console.error('❌ Error: MAILERSEND_API_KEY is not set in environment variables');
    console.error('   Please set MAILERSEND_API_KEY in your .env file');
    process.exit(1);
  }

  if (!MONGO_URI) {
    console.error('❌ Error: MONGO_URI is not set in environment variables');
    console.error('   Please set MONGO_URI in your .env file');
    process.exit(1);
  }

  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME
    });
    console.log('✅ Connected to MongoDB\n');

    // Parse command line arguments for limit
    const limitIndex = process.argv.indexOf('--limit');
    const emailLimit = limitIndex !== -1 && process.argv[limitIndex + 1] 
      ? parseInt(process.argv[limitIndex + 1], 10) 
      : 2; // Default to 2 for trial account limits

    // Fetch all users
    console.log('📊 Fetching all users from database...');
    const users = await AppUser.find({});
    console.log(`✅ Found ${users.length} user(s) in database\n`);

    if (users.length === 0) {
      console.log('⚠️  No users found in database. Exiting.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Filter users with valid email addresses who haven't received the update email yet
    const usersWithEmail = users.filter(user => {
      const email = user.email;
      if (!email || !email.trim()) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) return false;
      
      // Skip users who already received this update email or had it attempted
      // Check for updateEmailSentAt field (successful send) or updateEmailAttempted (failed but marked)
      if (user.updateEmailSentAt || user.updateEmailAttempted) {
        return false;
      }
      
      return true;
    });

    // Limit to the specified number (default 2)
    const usersToEmail = usersWithEmail.slice(0, emailLimit);

    console.log(`📧 ${usersWithEmail.length} user(s) have valid email addresses and haven't received the update email yet`);
    console.log(`📤 Will send to next ${usersToEmail.length} user(s) (limit: ${emailLimit})\n`);

    if (usersToEmail.length === 0) {
      console.log('✅ All users have already received the update email!');
      console.log('   No emails to send. Exiting.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Confirm before sending
    console.log('⚠️  WARNING: You are about to send emails to users.');
    console.log(`   This will send ${usersToEmail.length} email(s).`);
    console.log('\n   To proceed, pass the --confirm flag:');
    console.log(`   node scripts/send-update-emails.js --confirm${emailLimit !== 2 ? ` --limit ${emailLimit}` : ''}\n`);

    if (!process.argv.includes('--confirm')) {
      console.log('⏸️  Email sending cancelled. Add --confirm flag to proceed.');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('🚀 Starting to send emails...\n');

    // Send emails with rate limiting (to avoid hitting API limits)
    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 0; i < usersToEmail.length; i++) {
      const user = usersToEmail[i];
      console.log(`[${i + 1}/${usersToEmail.length}] Processing: ${user.email || user._id}...`);
      
      const result = await sendEmailToUser(user);
      
      if (result.success) {
        // Mark user as having received the update email
        try {
          await AppUser.updateOne(
            { _id: user._id },
            { 
              $set: { 
                updateEmailSentAt: new Date(),
                updateEmailSentLink: NEW_APP_DOWNLOAD_LINK
              }
            }
          );
          results.sent++;
        } catch (updateError) {
          console.warn(`⚠️  Email sent but failed to update user record: ${updateError.message}`);
          results.sent++; // Still count as sent since email was successful
        }
      } else {
        if (result.reason === 'No email address' || result.reason === 'Invalid email format') {
          results.skipped++;
        } else {
          // For MailerSend errors (status 422), mark as attempted so we don't keep trying
          // This includes domain verification errors, recipient limits, etc.
          const shouldMarkAsAttempted = result.statusCode === 422;
          
          if (shouldMarkAsAttempted) {
            try {
              await AppUser.updateOne(
                { _id: user._id },
                { 
                  $set: { 
                    updateEmailSentAt: new Date(),
                    updateEmailSentLink: NEW_APP_DOWNLOAD_LINK,
                    updateEmailError: result.reason || 'MailerSend restriction',
                    updateEmailAttempted: true
                  }
                }
              );
              console.log(`   ℹ️  Marked as attempted (won't retry due to MailerSend error #${result.statusCode})`);
            } catch (updateError) {
              console.warn(`   ⚠️  Failed to mark user as attempted: ${updateError.message}`);
            }
          }
          
          results.failed++;
          results.errors.push({ 
            email: user.email, 
            error: result.reason,
            details: result.details || {},
            statusCode: result.statusCode
          });
        }
      }

      // Rate limiting: wait 100ms between emails to avoid hitting API limits
      if (i < usersToEmail.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 EMAIL CAMPAIGN SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully sent: ${results.sent}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`📧 Total processed: ${usersToEmail.length}`);
    console.log(`📋 Remaining users without email: ${usersWithEmail.length - usersToEmail.length}`);
    console.log('='.repeat(60));
    
    if (usersWithEmail.length > usersToEmail.length) {
      console.log(`\n💡 To send to the next batch, run:`);
      console.log(`   node scripts/send-update-emails.js --confirm\n`);
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      results.errors.forEach(({ email, error, details, statusCode }) => {
        const errorMsg = error || 'Unknown error (no error message provided)';
        console.log(`   - ${email}: ${errorMsg}`);
        if (statusCode) {
          console.log(`     Status Code: ${statusCode}`);
        }
        if (details && Object.keys(details).length > 0) {
          console.log(`     Details: ${JSON.stringify(details, null, 2)}`);
        }
      });
    }

    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('✨ Email campaign completed!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore close errors
    }
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main, sendEmailToUser, createEmailHTML, createEmailText };

