const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Chatflow Webhook Server is running! ✅');
});

// Send notification webhook
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
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});s