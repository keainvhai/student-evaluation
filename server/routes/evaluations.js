const express = require("express");
const { requireAuth } = require("../middleware/auth");
const db = require("../models");

const router = express.Router();

// 给队友打分
router.post("/teams/:teamId/evaluations", requireAuth, async (req, res) => {
  const { evaluateeId, score, comment, anonymousToPeers } = req.body;
  console.log("📝 Received evaluation:", req.body);

  const teamId = req.params.teamId;

  const evalObj = await db.Evaluation.create({
    TeamId: teamId,
    evaluatorId: req.user.id,
    evaluateeId,
    score,
    comment,
    anonymousToPeers,
  });
  res.json(evalObj);
});

// ✅ 获取当前用户收到的所有评价
router.get("/teams/:teamId/evaluations/me", requireAuth, async (req, res) => {
  const { teamId } = req.params;

  try {
    const evals = await db.Evaluation.findAll({
      where: {
        TeamId: teamId,
        evaluateeId: req.user.id, // 当前登录用户是被评价者
      },
      include: [
        { model: db.User, as: "evaluator", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const result = evals.map((e) => ({
      id: e.id,
      score: e.score,
      comment: e.comment,
      anonymousToPeers: e.anonymousToPeers,
      evaluatorId: e.evaluatorId,
      evaluatorName:
        e.anonymousToPeers && e.evaluatorId !== req.user.id
          ? "Anonymous"
          : e.evaluator.name,
    }));

    console.log("🟢 My Received:", result);
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching received evaluations:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 获取当前用户给出的所有评价
router.get(
  "/teams/:teamId/evaluations/given",
  requireAuth,
  async (req, res) => {
    const { teamId } = req.params;

    try {
      const evals = await db.Evaluation.findAll({
        where: {
          TeamId: teamId,
          evaluatorId: req.user.id, // 当前登录用户是评价者
        },
        include: [
          { model: db.User, as: "evaluatee", attributes: ["id", "name"] },
        ],
        order: [["createdAt", "DESC"]],
      });

      const result = evals.map((e) => ({
        id: e.id,
        score: e.score,
        comment: e.comment,
        evaluateeId: e.evaluateeId,
        evaluateeName: e.evaluatee?.name || "Unknown",
        anonymousToPeers: e.anonymousToPeers,
      }));

      console.log("🟢 My Given:", result);
      res.json(result);
    } catch (err) {
      console.error("❌ Error fetching given evaluations:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ 获取当前小组所有评价（学生端+老师区分匿名）
// ✅ 获取当前小组所有评价（学生 & 老师共用）
router.get("/teams/:teamId/evaluations/all", requireAuth, async (req, res) => {
  const { teamId } = req.params;
  const isInstructor = req.user.role === "instructor"; // 🔹 关键判断

  try {
    const evals = await db.Evaluation.findAll({
      where: { TeamId: teamId },
      include: [
        { model: db.User, as: "evaluator", attributes: ["id", "name"] },
        { model: db.User, as: "evaluatee", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const result = evals.map((e) => ({
      id: e.id,
      score: e.score,
      comment: e.comment,
      anonymousToPeers: e.anonymousToPeers,
      evaluatorId: e.evaluatorId,
      evaluatorName:
        // 🔹 如果匿名 + 访问者不是老师 + 访问者不是本人 → 匿名处理
        e.anonymousToPeers && !isInstructor && e.evaluatorId !== req.user.id
          ? "Anonymous"
          : e.evaluator?.name || "Unknown",
      evaluateeName: e.evaluatee?.name || "Unknown",
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching evaluations:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
