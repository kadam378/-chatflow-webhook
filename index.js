const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const ONESIGNAL_APP_ID = "de090e53-aae0-43d5-879a-533989f269f7";
const ONESIGNAL_REST_API_KEY = "wavvl3sigezxujml4hrye2eei";

app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    console.log("📩 Webhook received:", JSON.stringify(body, null, 2));

    const type = body.type || body.event;
    if (type !== 'received' && type !== 'inbound') {
      console.log("⏩ Skipping event:", type);
      return res.status(200).json({ status: "skipped" });
    }

    const contactName = body.contact_name || body.from || "New Message";
    const message = body.message || body.text || "You have a new message";
    const chatUuid = body.chat_uuid || body.uuid || body.chat_id || "";
    const contactPhone = body.contact_phone || body.phone || "";

    const response = await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { en: contactName },
        contents: { en: message },
        data: {
          chat_uuid: chatUuid,
          contact_name: contactName,
          contact_phone: contactPhone,
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`
        }
      }
    );

    console.log("✅ Notification sent:", response.data);
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
