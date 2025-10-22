const express = require("express");
const { requireAuth } = require("../middleware/auth");
const db = require("../models");
const { Team } = require("../models");

const router = express.Router();

// 创建 team 的功能在course路由下，代表某个课下创建的team

// 加入 team
router.post("/:teamId/members", requireAuth, async (req, res) => {
  const { teamId } = req.params;
  await db.TeamMembership.findOrCreate({
    where: { teamId, userId: req.user.id },
  });
  res.json({ message: "Joined team" });
});

// ✅ 学生退出小组
router.delete("/:teamId/members", requireAuth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id; // 从 JWT 中取当前登录用户

    const membership = await db.TeamMembership.findOne({
      where: { teamId, userId },
    });

    if (!membership) {
      return res.status(404).json({ error: "Not in this team" });
    }

    await membership.destroy();
    res.json({ message: "Left the team successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to leave team" });
  }
});

// ✅ 获取小组详情 + 成员 + 课程老师
router.get("/:teamId", requireAuth, async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await db.Team.findByPk(teamId, {
      include: [
        {
          model: db.TeamMembership,
          include: [
            {
              model: db.User,
              attributes: ["id", "name", "email", "role"],
            },
          ],
        },
        {
          model: db.Course,
          attributes: ["id", "title", "aiEnabled"],
          include: [
            {
              model: db.User,
              as: "instructor",
              attributes: ["id", "name", "email", "role"],
            },
          ],
        },
      ],
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    // ✅ 把小组成员 + 老师一起返回
    const members = team.TeamMemberships.map((m) => m.User);
    const instructor = team.Course?.instructor;

    // 如果课程老师存在且未重复，则加入成员列表
    if (instructor && !members.some((u) => u.id === instructor.id)) {
      members.push(instructor);
    }

    const teamJson = team.toJSON();
    teamJson.AllMembers = members;

    res.json(teamJson);
  } catch (err) {
    console.error("❌ Error fetching team:", err);
    res.status(500).json({ error: "Failed to fetch team info" });
  }
});

// ✅ 更新小组名
router.patch("/:teamId", requireAuth, async (req, res) => {
  try {
    console.log("PATCH /teams/:teamId", req.params.teamId, req.body); // ✅ 调试打印

    const { name } = req.body;
    const team = await Team.findByPk(req.params.teamId);

    if (!team) {
      console.log("Team not found");
      return res.status(404).json({ error: "Team not found" });
    }

    team.name = name;
    await team.save();

    console.log("✅ Team updated:", team.name);
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update team name" });
  }
});

module.exports = router;
