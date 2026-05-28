const nodemailer = require("nodemailer");

/**
 * Sends a real or simulated email.
 * Fallback representation outputs email formatted to server console when SMTP configs are absent.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const hasSmtp =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  let transporter = null;

  if (hasSmtp) {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === "true", // true for port 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } catch (error) {
      console.error("❌ [Mailer Error] Failed to create SMTP transporter:", error.message);
    }
  }

  // If no SMTP configured, try to create an Ethereal Test Account for real-world simulation
  if (!transporter) {
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
      console.log("📧 [Ethereal Mail] Created temporary developer test mail account.");
    } catch (err) {
      console.warn("⚠️ [Mailer Warning] Failed to create Ethereal account, falling back to local console simulator.");
    }
  }

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"SupportSphere AI" <no-reply@supportsphere.ai>',
        to,
        subject,
        text: text || subject,
        html,
      });

      console.log(`✉️ [Mail Sent] Message ID: ${info.messageId} to ${to}`);
      
      const testUrl = nodemailer.getTestMessageUrl(info);
      if (testUrl) {
        console.log(`\n🔗 [ETHEREAL EMAIL] View sent email at: ${testUrl}\n`);
      }
      return info;
    } catch (error) {
      console.error("❌ [Mailer Error] Failed to send email:", error.message);
    }
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
