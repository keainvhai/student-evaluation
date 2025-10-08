const express = require("express");
const { requireAuth } = require("../middleware/auth");
const db = require("../models");

const router = express.Router();

// 创建 team在course路由下，代表某个课下创建的team
// router.post("/", requireAuth, async (req, res) => {
//   try {
//     const { courseId, name } = req.body;
//     if (!courseId || !name) {
//       return res.status(400).json({ error: "Missing courseId or name" });
//     }

//     const team = await db.Team.create({ CourseId: courseId, name });
//     await db.TeamMembership.create({ TeamId: team.id, UserId: req.user.id });
//     res.json(team);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to create team" });
//   }
// });

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
