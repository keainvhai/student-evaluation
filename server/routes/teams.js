const express = require("express");
const { requireAuth } = require("../middleware/auth");
const db = require("../models");

const router = express.Router();

// 创建 team
router.post("/", requireAuth, async (req, res) => {
  const { courseId, name } = req.body;
  const team = await db.Team.create({ courseId, name });
  await db.TeamMembership.create({ TeamId: team.id, UserId: req.user.id });
  res.json(team);
});

// 加入 team
router.post("/:teamId/members", requireAuth, async (req, res) => {
  const { teamId } = req.params;
  await db.TeamMembership.findOrCreate({
    where: { TeamId: teamId, UserId: req.user.id },
  });
  res.json({ message: "Joined team" });
});

// GET /teams/:teamId  → 获取小组详情 + 成员
router.get("/:teamId", requireAuth, async (req, res) => {
  const { teamId } = req.params;
  const team = await db.Team.findByPk(teamId, {
    include: {
      model: db.TeamMembership,
      // include: db.User,
      include: [{ model: db.User }],
    },
  });
  if (!team) return res.status(404).json({ error: "Team not found" });
  res.json(team);
});

module.exports = router;
