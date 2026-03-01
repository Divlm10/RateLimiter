import express from "express";

const router=express.Router();

import { fixedWindowLimiter } from "../middlewares/fixedWindowLimiter.js";
import { createFixedWindowLimiter } from "../middlewares/fixedWindowAdvanced.js";
import { createSlidingWindowLimiter } from "../middlewares/slidingWindowLimiter.js";
import { createOptimizedSlidingLimiter } from "../middlewares/slidingWindowLimiterOptimized.js";
import { createTokenBucketLimiter } from "../middlewares/tokenBucketLimiter.js";

router.get("/limited", fixedWindowLimiter, (req, res) => {
  res.json({ message: "Rate limited route working!" });
});

router.get("/open", (req, res) => {
  res.json({ message: "This route is not limited." });
});

const strictLimiter=createFixedWindowLimiter(60*1000,5);//5 max reqs in 60 secs
const relaxedLimiter=createFixedWindowLimiter(50*1000,8);//8 max reqs in 50 secs 

router.get("/strict",strictLimiter,(req,res)=>{
    res.json({message:"Strict limited route." });
});

router.get("/relaxed",relaxedLimiter,(req,res)=>{
    res.json({ message: "Relaxed limited route." });
});

const slidingLimiter=createSlidingWindowLimiter(60*1000,5);
const optimizedSlidingLimiter=createOptimizedSlidingLimiter(60*1000,4);

router.get("/sliding",slidingLimiter,(req,res)=>{
    res.json({message:"Sliding window router working."});
});

router.get("/optSliding",optimizedSlidingLimiter,(req,res)=>{
    res.json({message:"Optimized Sliding router is up and running."});
});

const tokenLimiter=createTokenBucketLimiter(5,1);//max tokens=5,refillrate=1

router.get("/token",tokenLimiter,(req,res)=>{
    res.json({message: "Token bucket route working"});
});

export default router;