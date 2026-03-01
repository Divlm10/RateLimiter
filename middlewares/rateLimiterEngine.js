const createRateLimiter=(options)=>{
    const {algorithm}=options;
    const requestStore={};

    return (req,res,next)=>{
        const ip=req.ip;
        const currentTime= Date.now();
        //intialize store
        if(!requestStore[ip]){
            if(algorithm=="fixed-window"){
                requestStore[ip]={ //start with count of 0
                    count:0,
                    windowStart: currentTime
                };
            }

            if(algorithm=="sliding-window"){
                requestStore[ip]=[];//array/queue of timestamps
            }

            if(algorithm=="token-bucket"){
                requestStore[ip]={ //extract capacity as max tokens to start with
                    tokens: options.capacity,
                    lastRefillTime: currentTime
                };
            }
        }
        //FIXED WINDOW//
        if(algorithm=="fixed-window"){
            const {windowSize,maxReq}=options;//extract from passed options 
            const data=requestStore[ip];

            if(currentTime - data.windowStart >= windowSize){//age exceeds allowed windowsize
                data.count=0;//reset
                data.windowStart=currentTime;
            }
            //check limit
            if(data.count >= maxReq){
                return res.status(429).json({ message: "Rate limit exceeded (Fixed Window)" });
            }
            data.count +=1;//valid
            res.setHeader("X-RateLimit-Limit", maxReq);
            res.setHeader("X-RateLimit-Remaining", maxReq - data.count);

            return next();//pass to actual route handle
        }

        //SLIDING WINDOW//
        if(algorithm=="sliding-window"){
            const {windowSize,maxReq}=options;
            const timestamps=requestStore[ip];//get full list of timestamps for that ip

            while(timestamps.length > 0 && currentTime - timestamps[0] >=windowSize){
                //timestamps exist and first stored timestamps[0] exceeds allowed limit
                timestamps.shift();//remove from left(first)
            }
            //check limit
            if(timestamps.length >=maxReq){ //totak requests=timestamps.length
                return res.status(429).json({ message: "Rate limit exceeded (Sliding Window)" });
            }
            //valid->safe to push currentime
            timestamps.push(currentTime);

            res.setHeader("X-RateLimit-Limit", maxReq);
            res.setHeader("X-RateLimit-Remaining", maxReq - timestamps.length);

            return next();
        }
        //TOKEN-BUCKET//
        if(algorithm=="token-bucket"){
            const {capacity,refillRate}=options;
            const bucket=requestStore[ip];//tokens,lastrefill

            const timeElapsed=(currentTime - bucket.lastRefillTime)/1000;
            const tokensToAdd=timeElapsed*refillRate;

            bucket.tokens=Math.min( capacity, bucket.tokens + tokensToAdd);
            //update lastrefill time
            bucket.lastRefillTime=currentTime;
            
            if(bucket.tokens < 1){
                //empty bucket=>block
                return res.status(429).json({ message: "Rate limit exceeded (Token Bucket)" });
            }
            //consume one token
            bucket.tokens -=1;
            res.setHeader("X-RateLimit-Limit", capacity);
            res.setHeader("X-RateLimit-Remaining", Math.floor(bucket.tokens));

            return next();
        }
        return next();
    };
};

export {createRateLimiter};