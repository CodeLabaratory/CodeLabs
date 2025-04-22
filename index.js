const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

const hashSHA256 = (value) => {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
};

const generateEventId = () => {
  return crypto.randomBytes(16).toString("hex"); // Generates a unique event ID
};

app.post("/lead", async (req, res) => {
  console.log("Received Event");

  // Hash the email and phone if they exist
  const hashedEmail = req.body.email ? hashSHA256(req.body.email) : undefined;

  // Generate or use the event_id sent by the frontend
  const eventId = req.body.event_id || generateEventId();

  const event = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: req.body.event_source_url || "http://127.0.0.1:5500",
    event_id: eventId,
    user_data: {
      client_user_agent:
        req.body.client_user_agent || req.headers["user-agent"],
      client_ip_address: req.ip,
      ...(hashedEmail && { em: hashedEmail }),
      ...(req.body.fbc && { fbc: req.body.fbc }),
      ...(req.body.fbp && { fbp: req.body.fbp }),
    },
    custom_data: {
      button_id: "lead_button_1",
    },
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PIXEL_ID}/events`,
      {
        data: [event],
        access_token: process.env.ACCESS_TOKEN,
        test_event_code: "TEST17497",
      }
    );

    res.json({ message: "Lead event sent to Meta!" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res
      .status(500)
      .json({ error: "Error sending to Meta", details: error.response?.data });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`My Server is running on port ${PORT}`);
});
