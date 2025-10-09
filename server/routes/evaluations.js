const express = require("express");
const { requireAuth } = require("../middleware/auth");
const db = require("../models");

const router = express.Router();

// 给队友打分
router.post("/teams/:teamId/evaluations", requireAuth, async (req, res) => {
  const { evaluateeId, score, comment, anonymousToPeers } = req.body;
  const teamId = req.params.teamId;

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
