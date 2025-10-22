const express = require("express");
const router = express.Router();
const db = require("../models");
const { requireAuth } = require("../middleware/auth");

// 禁止缓存
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ✅ 1. 获取当前用户所有通知（可选筛选未读）
router.get("/", requireAuth, async (req, res) => {
  try {
    const where = { userId: req.user.id };
    if (req.query.unread === "true") where.read = false;

    const notifications = await db.Notification.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (err) {
    console.error("❌ GET /notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ✅ 2. 获取未读数量
router.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const count = await db.Notification.count({
      where: { userId: req.user.id, read: false },
    });
    res.json({ count });
  } catch (err) {
    console.error("❌ GET /notifications/unread-count error:", err);
    res.status(500).json({ error: "Failed to count unread" });
  }
});

// ✅ 3. 创建通知（系统内部使用）
router.post("/", requireAuth, async (req, res) => {
  try {
    const { userId, type, title, body, link } = req.body;

    // 🔒 限制：只能创建给自己，或管理员/老师才能发给别人
    if (
      userId !== req.user.id &&
      req.user.role !== "instructor" &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to send notification" });
    }

    const n = await db.Notification.create({ userId, type, title, body, link });
    res.status(201).json(n);
  } catch (err) {
    console.error("❌ POST /notifications error:", err);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// ✅ 4. 标记已读
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const n = await db.Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!n) return res.status(404).json({ error: "Notification not found" });

    n.read = true;
    await n.save();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ PATCH /notifications/:id/read error:", err);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// ✅ 5. 删除通知
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const n = await db.Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!n) return res.status(404).json({ error: "Notification not found" });

    await n.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE /notifications/:id error:", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

module.exports = router;
