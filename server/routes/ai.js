// 统一路由，只负责分发任务
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { generateAIContent } = require("../services/aiService");

const router = express.Router();

router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { type, payload } = req.body;

    if (!type)
      return res.status(400).json({ error: "Missing generation type" });

    const content = await generateAIContent(type, payload || {});
    res.json({ content });
  } catch (err) {
    console.error("❌ AI generation error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
