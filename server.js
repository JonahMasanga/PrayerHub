require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const base64 = require("base-64");
const path = require("path");

const app = express();
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_API_URL = "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken"; // Sandbox API URL

// Helper function to get access token
async function getPesapalToken() {
  try {
    const credentials = `${PESAPAL_CONSUMER_KEY}:${PESAPAL_CONSUMER_SECRET}`;
    const encodedCredentials = base64.encode(credentials);

    const response = await axios.post(
      PESAPAL_API_URL,
      {},
      {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.token; // Return the token
  } catch (error) {
    console.error("Error getting token:", error.response?.data || error.message);
    throw new Error("Failed to get access token");
  }
}

// Step 1: Get Access Token Endpoint
app.get("/api/get-token", async (req, res) => {
  try {
    const token = await getPesapalToken();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Handle Payment Requests
app.post("/api/initiate-payment", async (req, res) => {
  const { amount, email, phone, description } = req.body;

  if (!amount || !email || !phone || !description) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Get access token
    const accessToken = await getPesapalToken();

    // Prepare payment request
    const paymentRequest = {
      Amount: amount,
      Currency: "UGX", // Set to your currency
      Description: description,
      Email: email,
      PhoneNumber: phone,
      Reference: `ORD_${Date.now()}`, // Unique order reference
      CallbackUrl: "https://yourdomain.com/payment-success", // Replace with your success URL
      NotificationId: "YOUR_NOTIFICATION_ID", // Pesapal Notification ID
    };

    // Submit payment request
    const paymentResponse = await axios.post(
      "https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest",
      paymentRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(paymentResponse.data);
  } catch (error) {
    console.error("Error initiating payment:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

//serve static ( e.g index.html)
app.use(express.static("public"));


// Route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});





// Handle Payment Form Submission
app.post("/pay", async (req, res) => {
  const { amount, email, phone, description } = req.body;

  if (!amount || !email || !phone || !description) {
    return res.status(400).json({ error: "All fields are required." });
  }

  res.json({ message: "Payment request received!", amount, email, phone, description });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
