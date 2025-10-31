const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors());

// --- ⚠️ MAKE SURE THESE ARE YOUR LIVE KEYS ---
const KEY_ID = "rzp_live_RZz1OkKBxRJyef"; // Paste your Live Key ID here
const KEY_SECRET = "9ftoGWBfWlz5g3i8UaHhjE5F"; // Paste your Live Key Secret here
// ---------------------------------

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now().toString().slice(-10)}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Order Created:", order);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Error creating order.");
  }
});

/**
 * THIS IS THE DEBUGGING SECTION
 */
app.post("/verify-payment", (req, res) => {
  console.log("\n--- /verify-payment ENDPOINT HIT ---");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  console.log("Received Order ID:", razorpay_order_id);
  console.log("Received Payment ID:", razorpay_payment_id);
  console.log("Received Signature from Razorpay:", razorpay_signature);

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET) // This uses your KEY_SECRET from line 11
    .update(body.toString())
    .digest("hex");

  console.log("--- SIGNATURE VERIFICATION ---");
  console.log("Generated Signature by Server:", expectedSignature);
  console.log("------------------------------------");

  if (expectedSignature === razorpay_signature) {
    console.log("✅ VERIFICATION SUCCESSFUL");
    res.json({
      status: "success",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } else {
    // This is what is happening
    console.error("❌ VERIFICATION FAILED: SIGNATURES DO NOT MATCH");
    res.status(400).json({ status: "failure" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});