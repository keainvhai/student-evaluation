const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");

const router = express.Router();

// 注册
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 8);
    const user = await db.User.create({
      name,
      email,
      passwordHash: hash,
      role,
    });

    // 注册完成直接返回 token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 登录
router.post("/login", async (req, res) => {
  console.log("REQ BODY:", req.body);
  const { email, password } = req.body;
  const user = await db.User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: "User not found" });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ token, user });
});

module.exports = router;
