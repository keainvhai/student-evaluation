const express = require("express");
const { requireAuth } = require("../middleware/auth");
const db = require("../models");

const router = express.Router();

// 给队友打分
router.post("/", requireAuth, async (req, res) => {
  const { teamId, evaluateeId, score, comment, anonymousToPeers } = req.body;
  const evalObj = await db.Evaluation.create({
    teamId,
    evaluatorId: req.user.id,
    evaluateeId,
    score,
    comment,
    anonymousToPeers,
  });
  res.json(evalObj);
});

module.exports = router;
