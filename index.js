const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.static(__dirname))
app.use(cors());
app.use(express.json());

app.post("/lead", async (req, res) => {
  const event = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: req.body.event_source_url || "http://127.0.0.1:5500",
    user_data: {
      client_user_agent: req.body.client_user_agent || req.headers["user-agent"],
      client_ip_address: req.ip,
      ...(req.body.email && { em: req.body.email }),
      ...(req.body.phone && { ph: req.body.phone }),
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
        access_token: process.env.ACCESS_TOKEN
      }
    );

    res.json({ message: "Lead event sent to Meta!" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error sending to Meta", details: error.response?.data });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`My Server is running on port ${PORT}`);
});
