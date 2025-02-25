// Set up request parameters
$consumerKey = 'cYZmXbANyExiVpmW1QtftPJrxQ5QQjKj';
$consumerSecret = 'xqqM6ArR9HfZLh3zy/AbNxj46To=';
$url = 'https://www.pesapal.com/API/PostPesapalDirectOrderV4';
// Set up payment details
$paymentData = array(
    "Amount" => "1000",          // Payment amount (e.g., 1000 KES)
    "Currency" => "KES",         // Currency (KES = Kenyan Shilling)
    "Description" => "Sample Payment", // Description of the payment
    "Email" => "customer@email.com",    // Customer's email
    "PhoneNumber" => "2547XXXXXXX",     // Customer's phone number
    "Reference" => "ORD123456",        // Unique order reference
);

// Convert data to JSON
$paymentDataJson = json_encode($paymentData);

// Step 2: Set up cURL for API request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . base64_encode($consumerKey . ':' . $consumerSecret),
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $paymentDataJson);

// Execute the request and get the response
$response = curl_exec($ch);
curl_close($ch);

// Step 3: Handle response
$responseData = json_decode($response, true);

// Check if the payment request was successful
if (isset($responseData['Status']) && $responseData['Status'] == 'Success') {
    $paymentUrl = $responseData['PaymentUrl']; // This is the URL to redirect users for payment
    header("Location: $paymentUrl"); // Redirect the user to the payment page
    exit;
} else {
    echo "Error: Unable to create payment request.";
}
 // Setup the



// IPN Listener (Pesapal will send data here after payment completion)
$ipnData = file_get_contents('php://input'); // Get the raw POST data sent by Pesapal
$ipnResponse = json_decode($ipnData, true);

// Check the payment status
if ($ipnResponse['Status'] == 'Completed') {
    // Process successful payment (e.g., update order status, send receipt)
    echo "Payment Successful!";
} else {
    // Handle failed payment (e.g., log error, notify customer)
    echo "Payment Failed or Pending!";
}

















