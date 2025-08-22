import { Router } from "express";
import Meeting from "../models/Meeting";

const router = Router();

// Create meeting
router.post("/create-meeting", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).send({ error: "Not logged in" });

  const meetingId = Math.random().toString(36).substring(7);
  await new Meeting({ meetingId, host: req.session.userId }).save();

  const meetingLink = `http://localhost:3000/room/${meetingId}`;
  res.send({ meetingId, meetingLink });
});

export default router;
