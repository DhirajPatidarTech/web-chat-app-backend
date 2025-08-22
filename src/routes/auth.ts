import { Router } from "express";
import User from "../models/User";

const router = Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).send({ error: "User exists" });

    const user = new User({ username, password });
    await user.save();

    req.session.userId = user.userId;
    res.send({ success: true, userId: user.userId });
  } catch {
    res.status(500).send({ error: "Signup failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).send({ error: "Invalid credentials" });

    req.session.userId = user.userId;
    res.send({ success: true, userId: user.userId });
  } catch {
    res.status(500).send({ error: "Login failed" });
  }
});


export default router;
