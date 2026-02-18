const express = require("express");
const cors = require("cors");
const Brevo = require('@getbrevo/brevo');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// 1. Setup Brevo API Client using your Render Environment Variable
let apiInstance = new Brevo.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY; // This pulls the key you just added to Render

// 2. The OTP Endpoint
app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send({ success: false, error: "Missing email or otp" });
  }

  // Define the email content
  let sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.subject = "Your Mídancer Verification Code";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h2>Mídancer Verification</h2>
      <p>Your 6-digit OTP code is:</p>
      <h1 style="color: #6200EE; letter-spacing: 5px;">${otp}</h1>
      <p>This code is valid for 10 minutes. Please do not share it.</p>
    </div>
  `;
  // IMPORTANT: Ensure this email is a "Verified Sender" in your Brevo Dashboard
  sendSmtpEmail.sender = { "name": "Mídancer", "email": "sukumarssoni@gmail.com" }; 
  sendSmtpEmail.to = [{ "email": email }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Success! OTP sent to ${email} via Brevo API`);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("❌ Brevo API Error:", error);
    res.status(500).send({ success: false, error: "Failed to send email. Check Render logs." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Mídancer Backend running on port ${PORT}`);
});