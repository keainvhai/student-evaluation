const express = require("express");
const { requireAuth } = require("../middleware/auth");
const db = require("../models");

const router = express.Router();

// 给队友打分
// ✅ 打分：允许老师跨组打分，学生打分老师
router.post("/teams/:teamId/evaluations", requireAuth, async (req, res) => {
  const { evaluateeId, score, comment, anonymousToPeers } = req.body;
  const teamId = req.params.teamId;
  const evaluatorId = req.user.id;

  const evaluator = await db.User.findByPk(evaluatorId);
  const evaluatee = await db.User.findByPk(evaluateeId);

  // ✅ 获取课程信息（用于老师跨组）
  const team = await db.Team.findByPk(teamId, {
    include: { model: db.Course, attributes: ["id", "instructorId"] },
  });

  const evaluatorInTeam = await db.TeamMembership.findOne({
    where: { teamId, userId: evaluatorId },
  });
  const evaluateeInTeam = await db.TeamMembership.findOne({
    where: { teamId, userId: evaluateeId },
  });

  const isInstructor = evaluator.role === "instructor";
  const isEvaluateeInstructor = evaluatee.role === "instructor";
  const isCourseInstructor =
    team && team.Course && team.Course.instructorId === evaluatorId;

  // ✅ 允许条件：
  // 1. 双方在同一 team
  // 2. 老师（课程 instructor）评价任意学生
  // 3. 学生评价课程老师
  if (
    !(
      (evaluatorInTeam && evaluateeInTeam) ||
      isInstructor ||
      isEvaluateeInstructor ||
      isCourseInstructor
    )
  ) {
    return res.status(403).json({
      error:
        "You can only evaluate your teammates, your course instructor, or if you're the instructor, any student in this course.",
    });
  }

  // ✅ 确认通过后再创建
  const evalObj = await db.Evaluation.create({
    teamId,
    evaluatorId,
    evaluateeId,
    score,
    comment,
    anonymousToPeers,
  });

  // ✅ 通知被评价人
  try {
    const evaluatorDisplay =
      anonymousToPeers && evaluatee.role !== "instructor"
        ? "Anonymous"
        : evaluator.name || "Someone";

    await db.Notification.create({
      userId: evaluateeId,
      type: "evaluation_received",
      title: "New Evaluation Received",
      body: `${evaluatorDisplay} submitted an evaluation for you.`,
      link: `/teams/${teamId}/evaluations`,
    });
  } catch (notifyErr) {
    console.error("⚠️ Failed to create notification:", notifyErr);
  }

  res.json(evalObj);
});

// ✅ 获取当前用户收到的所有评价
router.get("/teams/:teamId/evaluations/me", requireAuth, async (req, res) => {
  const { teamId } = req.params;

  try {
    const evals = await db.Evaluation.findAll({
      where: {
        teamId,
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
          teamId,
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
      where: { teamId },
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
