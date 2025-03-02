require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Pesapal Credentials (Make sure these are correctly set in Render)
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_CALLBACK_URL = process.env.PESAPAL_CALLBACK_URL;
const PESAPAL_NOTIFICATION_ID = process.env.PESAPAL_NOTIFICATION_ID; // Required for transaction tracking

// Ensure required environment variables are set
if (!PESAPAL_CONSUMER_KEY || !PESAPAL_CONSUMER_SECRET || !PESAPAL_CALLBACK_URL || !PESAPAL_NOTIFICATION_ID) {
    console.error("❌ Missing required Pesapal credentials. Check your .env file or Render environment variables.");
    process.exit(1); // Stop the server if credentials are missing
}

// Function to get Pesapal Access Token
async function getAccessToken() {
    const authUrl = "https://pay.pesapal.com/v3/api/Auth/RequestToken"; // ✅ Live API

    try {
        const response = await axios.post(
            authUrl,
            { consumer_key: PESAPAL_CONSUMER_KEY, consumer_secret: PESAPAL_CONSUMER_SECRET },
            { headers: { "Content-Type": "application/json" } }
        );
        return response.data.token;
    } catch (error) {
        console.error("❌ Error getting Pesapal token:", error.response?.data || error.message);
        throw new Error("Failed to get Pesapal token");
    }
}

// Route to initiate a payment
app.post("/initiate-payment", async (req, res) => {
    const { amount, currency, email, phone, description } = req.body;
    const reference = "TXN" + Date.now(); // Generate unique transaction reference

    try {
        const token = await getAccessToken();
        const paymentUrl = "https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest"; // ✅ Live API

        const paymentData = {
            id: reference,
            currency,
            amount,
            description,
            callback_url: PESAPAL_CALLBACK_URL,
            notification_id: PESAPAL_NOTIFICATION_ID, // Required for tracking payment status
            billing_address: {
                email_address: email,
                phone_number: phone,
                country_code: "UG",
                first_name: "User", // Optional, customize if needed
            },
        };

        const response = await axios.post(paymentUrl, paymentData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.data.redirect_url) {
            res.json({ redirect_url: response.data.redirect_url }); // Send payment link to frontend
        } else {
            res.status(500).json({ message: "❌ Failed to retrieve payment link", error: response.data });
        }
    } catch (error) {
        console.error("❌ Payment error:", error.response?.data || error.message);
        res.status(500).json({ message: "Payment initiation failed", error: error.response?.data || error.message });
    }
});

// Serve the main page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
