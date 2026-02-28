
const createOptimizedSlidingLimiter = (windowSize,maxReq)=>{
    const requestStore={};//ip->queue of timestamps
    
    return (req,res,next)=>{
        const ip=req.ip;
        const currentTime= Date.now();
        //first req
        if(!requestStore[ip]){
            requestStore[ip]=[];//intialize for that ip
        }
        const timestamps=requestStore[ip];//extract stored timestamps
        //remove expired timestamps from front only (timestamps[0])
        while(timestamps.length >0  && currentTime - timestamps[0] >= windowSize)
        {
            //exists and age(currentime - first stored timestamp) >= windowsize)
            timestamps.shift();//remove oldest(front)
        }
        //check limit
        if(timestamps.length >= maxReq){
            //exceeds
            return res.status(429).json({
                message:"Too many Requests. TRY AGAIN LATER."
            });
        }
        //within 
        timestamps.push(currentTime);//safe to insert curretimestamp
        //set headers
        res.setHeader("X-RateLimit-Limit", maxReq);
        res.setHeader(
            "X-RateLimit-Remaining",
            maxReq - timestamps.length  //max allowed - total timestamps stored
        );
        if(timestamps.length > 0){
            const oldestRequest=timestamps[0];//first req from start
            res.setHeader(
                "X-RateLimit-Reset",
                Math.ceil((oldestRequest + windowSize)/1000)
            );
        }
        next();//move
    }
};

export {createOptimizedSlidingLimiter};