const createTokenBucketLimiter = (capacity,refillRate)=>{
    const requestStore={};
    //ip->{tokens,lastRefillTime}
    return (req,res,next)=>{
        const ip=req.ip;
        const currentTime=Date.now();
        //first req
        if(!requestStore[ip]){
            requestStore[ip]={ //start with full capacity as tokens
                tokens: capacity,
                lastRefillTime: currentTime
            };
        }
        const bucket=requestStore[ip];
        //elapsed time in sec since last refill
        const timeElapsed=(currentTime - bucket.lastRefillTime)/1000;
        //calc how many tokens to refill
        const tokensToAdd=timeElapsed * refillRate;
        //update tokens(capped at capacity =>to avoid overflow due to tokensadded)
        bucket.tokens=Math.min(
            capacity,
            bucket.tokens + tokensToAdd
        );
        //update last refill time=>currentime
        bucket.lastRefillTime=currentTime;
        //handle limit
        if(bucket.tokens < 1){//bucket empty=>block
            return res.status(429).json({
                message:"Too many requests. TRY AGAIN LATER"
            });
        }
        //consume one token
        bucket.tokens -=1;
        //set headers
        res.setHeader("X-RateLimit-Limit",capacity);//intial
        res.setHeader("X-RateLimit-Remaining",Math.floor(bucket.tokens));

        next();//move to route handling
    }
}

export {createTokenBucketLimiter};

//O(1) memory
//Stores 2 numbers compared to multiple timestamps in sliding window