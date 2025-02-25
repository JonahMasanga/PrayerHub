// Import required modules
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// PesaPal credentials (replace with your actual credentials)
const PESAPAL_CONSUMER_KEY = 'cYZmXbANyExiVpmW1QtftPJrxQ5QQjKj'; // Replace with your actual consumer key
const PESAPAL_CONSUMER_SECRET = 'xqqM6ArR9HfZLh3zy/AbNxj46To='; // Replace with your actual consumer secret
const PESAPAL_API_URL = 'https://www.pesapal.com/api';

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the PesaPal Integration Server!');
});

// Route to initiate payment
app.post('/initiate-payment', async (req, res) => {
    // Extract data from the request body
    const { amount, email, phone, description } = req.body;

    // Create the JSON payload for PesaPal
    const payload = {
        consumer_key: PESAPAL_CONSUMER_KEY,
        consumer_secret: PESAPAL_CONSUMER_SECRET,
        amount: amount,
        email: email,
        phone_number: phone,
        description: description,
        callback_url: 'http://localhost:3000/callback', // Replace with your callback URL
    };

    try {
        // Send the payload to PesaPal API
        const response = await axios.post(`${PESAPAL_API_URL}/postpesapaldirectorderv4`, payload);

        // Return the response from PesaPal to the client
        res.json(response.data);
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: error.message });
    }
});

// Callback URL for PesaPal
app.post('/callback', (req, res) => {
    // Extract data from the callback
    const { pesapal_merchant_reference, pesapal_transaction_tracking_id } = req.body;

    // Log the callback data (for debugging)
    console.log('Payment callback received:', {
        pesapal_merchant_reference,
        pesapal_transaction_tracking_id,
    });

    // Send a success response to PesaPal
    res.sendStatus(200);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
