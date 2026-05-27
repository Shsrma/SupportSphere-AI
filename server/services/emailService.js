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

  if (hasSmtp) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === "true", // true for port 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"SupportSphere AI" <no-reply@supportsphere.ai>',
        to,
        subject,
        text: text || subject,
        html,
      });

      console.log(`✉️ [Mail Sent] Message ID: ${info.messageId} to ${to}`);
      return info;
    } catch (error) {
      console.error("❌ [Mailer Error] Failed to send email via SMTP:", error.message);
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
