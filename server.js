require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from frontend

// Pesapal Credentials (Set in .env or GitHub Secrets)
const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_CALLBACK_URL = process.env.PESAPAL_CALLBACK_URL;

// Generate Access Token
async function getAccessToken() {
    const authUrl = "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken";
    const credentials = { consumer_key: PESAPAL_CONSUMER_KEY, consumer_secret: PESAPAL_CONSUMER_SECRET };

    try {
        const response = await axios.post(authUrl, credentials, { headers: { "Content-Type": "application/json" } });
        return response.data.token; // Pesapal Access Token
    } catch (error) {
        console.error("Error getting Pesapal token:", error.response?.data || error.message);
        throw new Error("Failed to get Pesapal token");
    }
}

// Initiate Payment
app.post("/initiate-payment", async (req, res) => {
    const { amount, currency, email, phone, description } = req.body;
    const reference = "TXN" + Date.now(); // Unique reference

    try {
        const token = await getAccessToken();

        // Pesapal Payment API
        const paymentUrl = "https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest";

        const paymentData = {
            id: reference,
            currency,
            amount,
            description,
            callback_url: PESAPAL_CALLBACK_URL,
            notification_id: "YOUR_NOTIFICATION_ID", // Required for callback handling
            billing_address: { email_address: email, phone_number: phone, country_code: "UG", first_name: "User" }
        };

        const response = await axios.post(paymentUrl, paymentData, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        });

        const redirect_url = response.data.redirect_url; // Pesapal Payment Link
        res.json({ redirect_url });

    } catch (error) {
        console.error("Payment error:", error.response?.data || error.message);
        res.status(500).json({ message: "Payment initiation failed" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
