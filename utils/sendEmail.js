const nodemailer = require('nodemailer');

/**
 * Send an email using nodemailer.
 * Falls back to logging to console in development if SMTP environment variables are missing.
 * 
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Text body of the email
 */
const sendEmail = async (options) => {
  const isSmtpConfigured = 
    process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    !process.env.SMTP_USER.includes('YOUR_GMAIL_ADDRESS') &&
    process.env.SMTP_PASS && 
    !process.env.SMTP_PASS.includes('YOUR_16_DIGIT_GMAIL_APP_PASSWORD');

  if (!isSmtpConfigured) {
    console.log('\n=============================================');
    console.log('✉️  [DEVELOPMENT EMAIL LOG]  ✉️');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('=============================================\n');

    // Also write to a local debug log file for easy script testing
    try {
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '../email-debug.log');
      const logEntry = `\n=============================================\nDate:    ${new Date().toISOString()}\nTo:      ${options.email}\nSubject: ${options.subject}\nMessage:\n${options.message}\n=============================================\n`;
      fs.appendFileSync(logPath, logEntry, 'utf8');
    } catch (err) {
      console.error('Error writing to email-debug.log:', err);
    }
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Writing Workspace'} <${process.env.FROM_EMAIL || 'no-reply@workspace.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
