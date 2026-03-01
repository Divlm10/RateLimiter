import express from "express";

const router= express.Router();

import { createRateLimiter } from "../middlewares/rateLimiterEngine.js";

//sent as options
const fixedLimiter=createRateLimiter({
    algorithm: "fixed-window",
    windowSize: 60*1000,
    maxReq: 5
});

const slidingLimiter=createRateLimiter({
    algorithm: "sliding-window",
    windowSize: 60*1000,
    maxReq: 5
});

const tokenLimiter=createRateLimiter({
    algorithm: "token-bucket",
    capacity: 5,
    refillRate: 1
});

router.get("/fixed",fixedLimiter,(req,res)=>{
    res.json({message:"Fixed Window route"});
})

router.get("/sliding", slidingLimiter, (req, res) => {
   res.json({ message: "Sliding Window Route" });
});

router.get("/token", tokenLimiter, (req, res) => {
   res.json({ message: "Token Bucket Route" });
});

export default router;