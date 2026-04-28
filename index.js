const express = require('express');
const admin = require('firebase-admin');
const app = express();
app.use(express.json());

// Firebase initialize
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;
    console.log('Webhook received:', JSON.stringify(data));

    if (data.event === 'message.received') {
      await db.collection('messages').add({
        phone: data.data.contact.phone,
        name: data.data.contact.first_name,
        message: data.data.message,
        type: 'received',
        timestamp: new Date()
      });
      console.log('Message saved to Firestore!');
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
