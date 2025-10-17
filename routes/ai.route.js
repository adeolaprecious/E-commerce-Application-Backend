const express = require("express");
const axios = require("axios");
const Product = require("../models/product.model");
const router = express.Router();

router.post("/search", async (req, res) => {
  const { query } = req.body;

  try {
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI search assistant for an e-commerce app called Diva. The user will type partial queries like 'amber dre' or 'bags under 20000'. Suggest up to 5 helpful search terms they might mean.",
          },
          { role: "user", content: query },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const aiText = aiResponse.data.choices[0].message.content;

    // Split suggestions (AI usually returns in list format)
    const suggestions = aiText
      .split("\n")
      .map((s) => s.replace(/^[\d\-\.\s]+/, "").trim())
      .filter((s) => s.length > 0)
      .slice(0, 5);

    res.json({ suggestions });
  } catch (error) {
    console.error("AI search error:", error.message);
    res.status(500).json({ error: "AI search failed" });
  }
});

router.post("/", async (req, res) => {
  const { message } = req.body;

  try {

    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Diva’s AI shopping assistant. Extract what product the user wants, optional price, and color.",
          },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const aiText = aiResponse.data.choices[0].message.content.toLowerCase();

    let query = {};
    if (aiText.includes("dress")) query.category = "women's clothing";
    if (aiText.includes("shirt") || aiText.includes("t-shirt"))
      query.category = "men's clothing";
    if (aiText.includes("bag")) query.category = "bags";
    if (aiText.includes("shoe")) query.category = "shoes";
    if (aiText.includes("amber")) query.color = "amber";

    const priceMatch = aiText.match(/under\s*₦?(\d+)/);
    if (priceMatch) query.price = { $lt: parseInt(priceMatch[1]) };

    const products = await Product.find(query).limit(5);

    if (products.length > 0) {
      const reply = `Here are some ${query.category || "items"} I found for you:`;
      res.json({ reply, products });
    } else {
      res.json({
        reply: "I couldn't find matching products yet — please try again later!",
      });
    }
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching AI results." });
  }
});

module.exports = router;
