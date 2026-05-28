let twilio = null;
try {
  twilio = require("twilio");
} catch (err) {
  console.warn("⚠️ [SMS Service] twilio package is not installed. Will use local console fallback.");
}

const isConfigured =
  twilio &&
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (isConfigured) {
  try {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log("📱 [SMS Service] Twilio initialized successfully.");
  } catch (err) {
    console.error("❌ [SMS Service] Failed to initialize Twilio client:", err.message);
  }
} else {
  console.log("📱 [SMS Service] Not configured or package missing. Operating in local console simulator mode.");
}

/**
 * Sends an SMS message to a phone number.
 * @param {Object} params
 * @param {string} params.to - Recipient phone number.
 * @param {string} params.body - SMS message body.
 * @returns {Promise<Object>}
 */
const sendSms = async ({ to, body }) => {
  if (!to) {
    return { success: false, error: "Recipient phone number is required" };
  }

  if (isConfigured && client) {
    try {
      const message = await client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
      console.log(`📱 [SMS Sent] Message SID: ${message.sid} to ${to}`);
      return { success: true, sid: message.sid };
    } catch (error) {
      console.error("❌ [Twilio Error] Failed to send SMS:", error.message);
    }
  }

  // Beautiful Console Fallback box for local developer visibility
  const separator = "═".repeat(65);
  const thinSeparator = "─".repeat(65);

  console.log(`\n${separator}`);
  console.log(`📱  [LOCAL SMS SERVICE SIMULATOR]`);
  console.log(`    To:   ${to}`);
  console.log(`    From: SupportSphere AI <no-reply-sms@supportsphere.ai>`);
  console.log(thinSeparator);
  console.log(`    Body: ${body}`);
  console.log(`${separator}\n`);

  return { simulated: true, to, body };
};

module.exports = {
  sendSms,
  isSmsConfigured: !!isConfigured,
};
