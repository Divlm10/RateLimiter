
const createSlidingWindowLimiter = (windowSize,maxReq)=>{
    const requestStore={};//array of timestamps for each ip
    
    return (req,res,next)=>{
        const ip=req.ip;//get clients ip
        const currentTime= Date.now();

        if(!requestStore[ip]){
            //first req
            requestStore[ip]=[];//intialize array per IP
        }
        //remove timestamps outside window in O(n)   [deque for opt]
        requestStore[ip]=requestStore[ip].filter(
            //keep only those timestamps in array of curr ip where age(currentime - timestamp) within windowsize
            (timestamp)=> currentTime - timestamp < windowSize
        );
        const currRequests = requestStore[ip].length; //total no of remaining stored timestamps for curr ip->no of valid reqs
        //check limit
        if(currRequests >= maxReq){
            //exceeded
            return res.status(429).json({
                message: "Too many Requests (Sliding Window). TRY AGAIN LATER"
            });
        }
        //within limit
        requestStore[ip].push(currentTime);//safe to insert currentime timestamp 
        //set headers
        res.setHeader("X-RateLimit-Limit",maxReq);
        res.setHeader("X-RateLimit-Remaining", maxReq - requestStore[ip].length);//max allowed - no of requests(timestamps) in ip array
        
        if(requestStore[ip].length >0){
            //Read oldest(first)requests from start of window=>calc RESET time
            const oldestRequest= requestStore[ip][0];// [0]->first
            res.setHeader(
                "X-RateLimit-Reset",
                Math.ceil((oldestRequest + windowSize)/1000)
            );
        }
        next();//limiter passed->move to actual route handler
    }
};

export {createSlidingWindowLimiter};
