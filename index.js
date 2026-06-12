const express = require('express');
const https = require('https');
const app = express();

app.use(express.json());

const ONESIGNAL_APP_ID = "de090e53-aae0-43d5-879a-533989f269f7";
const ONESIGNAL_REST_API_KEY = "wavvl3sigezxujml4hrye2eei";

function sendOneSignalNotification(title, message, chatUuid, contactName, contactPhone) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["All"],
      headings: { en: title },
      contents: { en: message },
      data: {
        chat_uuid: chatUuid,
        contact_name: contactName,
        contact_phone: contactPhone,
      }
    });

    const options = {
      hostname: 'onesignal.com',
      path: '/api/v1/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log("✅ OneSignal response:", data);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.error("❌ OneSignal error:", e);
      reject(e);
    });

    req.write(body);
    req.end();
  });
}

app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log("📩 Webhook received:", JSON.stringify(body, null, 2));

    const type = body.type || body.event;
    if (type !== 'received' && type !== 'inbound' && type !== 'message.received') {
      console.log("⏩ Skipping event:", type);
      return res.status(200).json({ status: "skipped" });
    }

const contactName = body.data?.contact?.first_name || body.data?.from || body.contact_name || "New Message";
const message = body.data?.message || body.message || "You have a new message";
const chatUuid = body.data?.chat_id || body.chat_uuid || "";
const contactPhone = body.data?.from || body.contact_phone || "";

    await sendOneSignalNotification(contactName, message, chatUuid, contactName, contactPhone);

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: "ChatFlow Webhook Server Running ✅" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
