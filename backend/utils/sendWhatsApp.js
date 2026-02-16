const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

const sendWhatsApp = async (phone, message) => {
  try {
    console.log("📱 Sending WhatsApp to:", phone);

    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,   // sandbox number
      to: `whatsapp:${phone}`
    });

    console.log("✅ WhatsApp Sent:", response.sid);
  } catch (error) {
    console.log("❌ WhatsApp Error:", error.message);
  }
};

module.exports = sendWhatsApp;
