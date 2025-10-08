const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { requireAuth, requireRole } = require("../middleware/auth");
const db = require("../models");

const router = express.Router();

// 老师建课
router.post("/", requireAuth, requireRole("instructor"), async (req, res) => {
  const { title, code } = req.body;
  const joinToken = uuidv4();
  const course = await db.Course.create({
    title,
    code,
    joinToken,
    instructorId: req.user.id,
  });
  res.json(course);
});

// 学生用 token 加入
router.post("/join", requireAuth, async (req, res) => {
  const { joinToken } = req.body;
  const course = await db.Course.findOne({ where: { joinToken } });
  if (!course) return res.status(404).json({ error: "Course not found" });

  await db.Enrollment.findOrCreate({
    where: { CourseId: course.id, UserId: req.user.id },
  });
  // res.json({ message: "Joined", courseId: course.id });
  res.json({ message: "Joined", course });
});

// 老师获取自己建的课程
router.get(
  "/mine",
  requireAuth,
  requireRole("instructor"),
  async (req, res) => {
    console.log(">>> GET /courses/mine called by user:", req.user);
    try {
      const courses = await db.Course.findAll({
        where: { instructorId: req.user.id },
      });
      res.json(courses);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 学生获取自己加入的课程
router.get("/joined", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const enrollments = await db.Enrollment.findAll({
      where: { UserId: req.user.id },
      // include: [db.Course],
      include: [
        {
          model: db.Course,
          include: [
            {
              model: db.User,
              as: "instructor",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });
    res.json(enrollments.map((e) => e.Course));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取课程所有小组
router.get("/:courseId/teams", requireAuth, async (req, res) => {
  const { courseId } = req.params;
  const teams = await db.Team.findAll({ where: { courseId } });
  res.json(teams);
});

// ✅ 创建 Team
router.post("/:courseId/teams", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Missing team name" });

    const team = await db.Team.create({ CourseId: courseId, name });
    await db.TeamMembership.create({ TeamId: team.id, UserId: req.user.id });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create team" });
  }
});

// ✅ 获取课程下所有 Teams
router.get("/:courseId/teams", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const teams = await db.Team.findAll({
      where: { CourseId: courseId },
      include: [
        {
          model: db.TeamMembership,
          include: [{ model: db.User, attributes: ["id", "name", "email"] }],
        },
      ],
    });
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

module.exports = router;
