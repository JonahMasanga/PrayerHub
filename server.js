require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_API_URL = "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken"; // Sandbox API URL

// Step 1: Get Access Token
app.get("/api/get-token", async (req, res) => {
  try {
    const response = await axios.post(
      PESAPAL_API_URL,
      {
        consumer_key: PESAPAL_CONSUMER_KEY,
        consumer_secret: PESAPAL_CONSUMER_SECRET,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error getting token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get access token" });
  }
});

// Step 2: Handle Payment Requests
app.post("/api/initiate-payment", async (req, res) => {
  const { amount, email, phone, description } = req.body;

  try {
    const tokenResponse = await axios.post(PESAPAL_API_URL, {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET,
    });

    const accessToken = tokenResponse.data.token;
    
    const paymentRequest = {
      Amount: amount,
      Currency: "UGX", // Set to your currency
      Description: description,
      Email: email,
      PhoneNumber: phone,
      Reference: `ORD_${Date.now()}`,
    };

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

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use(express.json()); // Make sure this line is at the top to parse JSON requests

app.post("/pay", async (req, res) => {
    const { amount, email, phone, description } = req.body;

    if (!amount || !email || !phone || !description) {
        return res.status(400).json({ error: "All fields are required." });
    }

    res.json({ message: "Payment request received!", amount, email, phone, description });
});
