import express from "express";

const router=express.Router();

import { fixedWindowLimiter } from "../middlewares/fixedWindowLimiter.js";

router.get("/limited", fixedWindowLimiter, (req, res) => {
  res.json({ message: "Rate limited route working!" });
});

router.get("/open", (req, res) => {
  res.json({ message: "This route is not limited." });
});

export default router;