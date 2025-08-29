import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const SHOPIFY_STORE = "your-store-name.myshopify.com"; // 🔁 Palitan ng store domain mo
const ADMIN_API_TOKEN = "shpat_xxxxxxxxxxxxx"; // 🔁 Yung nakuha mong API token

// API endpoint: /track-order
app.get("/track-order", async (req, res) => {
  const { order, email } = req.query;

  if (!order || !email) {
    return res.json({ success: false, message: "Missing order or email" });
  }

  try {
    // 🔹 Call Shopify API (Orders)
    const response = await fetch(
      `https://${SHOPIFY_STORE}/admin/api/2025-01/orders.json?name=${order}&email=${email}`,
      {
        headers: {
          "X-Shopify-Access-Token": ADMIN_API_TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!data.orders || data.orders.length === 0) {
      return res.json({ success: false, message: "Order not found" });
    }

    const orderData = data.orders[0];
    const fulfillment = orderData.fulfillments?.[0] || {};

    res.json({
      success: true,
      status: orderData.fulfillment_status || "Pending",
      tracking_number: fulfillment.tracking_number || "Not available yet",
      carrier: fulfillment.tracking_company || "Unknown"
    });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error fetching order" });
  }
});

// Run server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
