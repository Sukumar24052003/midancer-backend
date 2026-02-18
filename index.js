const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// 1. Setup Nodemailer - FIXED SENDER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sukumarssoni@gmail.com', // Always the sender
    pass: 'manquzgiwjdupwty'        // Your 16-character App Password (no spaces)
  }
});

// 2. The OTP Endpoint
app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send({ success: false, error: "Missing email or otp" });
  }

  const mailOptions = {
    from: '"Mídancer" <sukumarssoni@gmail.com>',
    to: email, // This sends it to the user's registered address
    subject: 'Your Mídancer Verification Code',
    text: `Your 6-digit verification code is: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #6200EE;">Mídancer Verification</h2>
        <p>Your 6-digit verification code is:</p>
        <h1 style="letter-spacing: 5px; color: #333;">${otp}</h1>
        <p>This code will expire shortly. Do not share this with anyone.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Success! Email sent to ${email}`);
    console.log(`Response: ${info.response}`);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("❌ Email Error:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// 3. Start the server locally for testing
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// For Firebase Deployment
exports.api = functions.https.onRequest(app);