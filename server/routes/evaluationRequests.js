const express = require("express");
const router = express.Router();
const { EvaluationRequest, TeamMembership } = require("../models");
const { requireAuth } = require("../middleware/auth");

// ✅ 发起评价请求
router.post(
  "/teams/:teamId/evaluation-requests",
  requireAuth,
  async (req, res) => {
    try {
      const { requestee_id } = req.body;
      const teamId = req.params.teamId;
      const requesterId = req.user.id;

      // 确认双方在同一小组
      const requesterInTeam = await TeamMembership.findOne({
        where: { teamId, userId: requesterId },
      });
      const requesteeInTeam = await TeamMembership.findOne({
        where: { teamId, userId: requestee_id },
      });

      if (!requesterInTeam || !requesteeInTeam) {
        return res
          .status(403)
          .json({ error: "Both users must be in the same team." });
      }

      // 检查是否已有待处理请求
      const existing = await EvaluationRequest.findOne({
        where: {
          teamId,
          requesterId,
          requesteeId: requestee_id,
          status: "pending",
        },
      });
      if (existing) {
        return res.status(400).json({ error: "Request already pending." });
      }

      // 创建新请求
      const newRequest = await EvaluationRequest.create({
        teamId,
        requesterId,
        requesteeId: requestee_id,
        status: "pending",
      });

      res.json(newRequest);
    } catch (err) {
      console.error("❌ Failed to create evaluation request:", err);
      res
        .status(500)
        .json({ error: "Server error creating evaluation request" });
    }
  }
);

// ✅ 我发起的请求
router.get("/me/requests/sent", requireAuth, async (req, res) => {
  const list = await EvaluationRequest.findAll({
    where: { requesterId: req.user.id },
    include: ["Requestee"],
  });
  res.json(list);
});

// ✅ 我收到的请求
router.get("/me/requests/received", requireAuth, async (req, res) => {
  const list = await EvaluationRequest.findAll({
    where: { requesteeId: req.user.id },
    include: ["Requester"],
  });
  res.json(list);
});

// ✅ 更新请求状态（完成）
router.patch("/evaluation-requests/:id", requireAuth, async (req, res) => {
  const { status } = req.body;
  const request = await EvaluationRequest.findByPk(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  request.status = status || "completed";
  await request.save();
  res.json(request);
});

module.exports = router;
