const nodemailer = require("nodemailer");

/**
 * Sends a real or simulated email.
 * Fallback representation outputs email formatted to server console when SMTP configs are absent.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  let transporter = null;
  let sentInfo = null;

  // 1. Try Gmail SMTP
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      sentInfo = await transporter.sendMail({
        from: `"SupportSphere AI" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text: text || subject,
        html,
      });

      console.log(`✉️ [Mail Sent via Gmail] Message ID: ${sentInfo.messageId} to ${to}`);
      return sentInfo;
    } catch (error) {
      console.error("❌ [Gmail SMTP Error] Failed to send email via Gmail:", error.message);
    }
  }

  // 2. Try Outlook SMTP (as fallback or if Gmail not configured)
  if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.OUTLOOK_USER,
          pass: process.env.OUTLOOK_PASS,
        },
      });

      sentInfo = await transporter.sendMail({
        from: `"SupportSphere AI" <${process.env.OUTLOOK_USER}>`,
        to,
        subject,
        text: text || subject,
        html,
      });

      console.log(`✉️ [Mail Sent via Outlook] Message ID: ${sentInfo.messageId} to ${to}`);
      return sentInfo;
    } catch (error) {
      console.error("❌ [Outlook SMTP Error] Failed to send email via Outlook:", error.message);
    }
  }

  // 3. Try Ethereal Test Account (if both SMTP providers are unconfigured or failed)
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    sentInfo = await transporter.sendMail({
      from: '"SupportSphere AI" <no-reply@supportsphere.ai>',
      to,
      subject,
      text: text || subject,
      html,
    });

    console.log(`📧 [Ethereal Mail] Created temporary developer test account and sent email.`);
    console.log(`✉️ [Mail Sent via Ethereal] Message ID: ${sentInfo.messageId} to ${to}`);
    
    const testUrl = nodemailer.getTestMessageUrl(sentInfo);
    if (testUrl) {
      console.log(`\n🔗 [ETHEREAL EMAIL] View sent email at: ${testUrl}\n`);
    }
    return sentInfo;
  } catch (err) {
    console.warn("⚠️ [Mailer Warning] Failed to create Ethereal account, falling back to local console simulator.");
  }

  // Beautiful Console Fallback box for local developer visibility
  const separator = "═".repeat(65);
  const thinSeparator = "─".repeat(65);
  
  // Basic HTML parser for console readability
  let cleanedText = text || html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // strip styles
    .replace(/<[^>]+>/g, " ")                       // strip tags
    .replace(/\s+/g, " ")                            // clean spacing
    .trim();

  console.log(`\n${separator}`);
  console.log(`📧  [LOCAL EMAIL SERVICE SIMULATOR]`);
  console.log(`    To:      ${to}`);
  console.log(`    From:    SupportSphere AI <no-reply@supportsphere.ai>`);
  console.log(`    Subject: ${subject}`);
  console.log(thinSeparator);
  console.log(`    Body:\n\n    ${cleanedText}`);
  console.log(`${separator}\n`);

  return { simulated: true, to, subject };
};

module.exports = sendEmail;
