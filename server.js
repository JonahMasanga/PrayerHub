require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_API_URL = process.env.PESAPAL_API_URL;
const CALLBACK_URL = process.env.CALLBACK_URL;
const PORT = process.env.PORT || 5000;

// ✅ Ensure environment variables are loaded
if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET) {
  console.error("❌ Missing Pesapal API credentials in .env file!");
  process.exit(1);
}

// ✅ Initialize OAuth 1.0a
const oauth = OAuth({
  consumer: {
    key: PESAPAL_CONSUMER_KEY,
    secret: PESAPAL_CONSUMER_SECRET,
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

// ✅ Function to get OAuth token from Pesapal
async function getAccessToken() {
  const requestData = {
    url: `${PESAPAL_API_URL}/api/Auth/RequestToken`,
    method: "POST",
  };

  const headers = oauth.toHeader(oauth.authorize(requestData));
  headers["Content-Type"] = "application/json";

  console.log("🔍 OAuth Headers:", headers);

  try {
    const response = await axios.post(requestData.url, {}, { headers });
    console.log("✅ Pesapal Token Response:", response.data);
    return response.data.token;
  } catch (error) {
    console.error("❌ Pesapal Auth Error:", error.response?.data || error.message);
    return null;
  }
}

// ✅ Route to initiate payment
app.post("/pesapal/pay", async (req, res) => {
  try {
    const token = await getAccessToken();
    if (!token) return res.status(500).json({ error: "Failed to get token" });

    const { amount, email, phone, reference } = req.body;

    const paymentData = {
      id: reference,
      currency: "UGX",
      amount: amount,
      description: "Payment for services",
      callback_url: CALLBACK_URL,
      notification_id: "YOUR_UNIQUE_ID",
      billing_address: {
        email_address: email,
        phone_number: phone,
        country_code: "UG",
      },
    };

    console.log("📌 Payment Data:", paymentData);

    const response = await axios.post(
      `${PESAPAL_API_URL}/api/Transactions/SubmitOrderRequest`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Payment Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Payment Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initiate payment", details: error.response?.data });
  }
});

// ✅ Route to handle IPN (Instant Payment Notification)
app.post("/pesapal/ipn", async (req, res) => {
  try {
    const { OrderTrackingId, OrderNotificationType } = req.body;

    if (OrderNotificationType !== "ORDER_COMPLETED") {
      return res.status(400).json({ error: "Invalid notification type" });
    }

    const token = await getAccessToken();
    if (!token) return res.status(500).json({ error: "Failed to get token" });

    const response = await axios.get(
      `${PESAPAL_API_URL}/api/Transactions/GetTransactionStatus?OrderTrackingId=${OrderTrackingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("📌 Payment Status:", response.data.status);
    res.json({ message: "Payment status updated", status: response.data.status });
  } catch (error) {
    console.error("❌ IPN Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to process IPN", details: error.response?.data });
  }
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
