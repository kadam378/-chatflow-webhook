const express = require('express');
const admin = require('firebase-admin');

let keyData = process.env.SERVICE_ACCOUNT_KEY;
keyData = keyData.replace(/(\r\n|\n|\r)/g, '\\n');
const serviceAccount = JSON.parse(keyData);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Chatflow Webhook Server is running! ✅');
});

app.post('/send-notification', async (req, res) => {
  const { token, title, body, data } = req.body;
  try {
    const message = {
      notification: { title, body },
      data: data || {},
      token,
    };
    const response = await admin.messaging().send(message);
    res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
