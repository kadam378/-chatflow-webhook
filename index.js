const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');

let serviceAccount;
try {
  const raw = fs.readFileSync('/etc/secrets/serviceAccount.json', 'utf8');
  console.log('File read success, length:', raw.length);
  serviceAccount = JSON.parse(raw);
  console.log('JSON parse success, type:', serviceAccount.type);
} catch (e) {
  console.error('File/JSON error:', e.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
