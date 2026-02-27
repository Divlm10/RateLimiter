
const createFixedWindowLimiter= (windowSize,maxReq)=>{ //configuarable limiter(factory pattern) with headers
    const requestStore={};
    
    return (req,res,next)=>{
        const ip=req.ip; //clients ip
        const currentTime = Date.now();

        if(!requestStore[ip]){
            //first request
            requestStore[ip]={
                count:1,
                windowStart: currentTime
            };
            //set headers
            res.setHeader("X-RateLimit-Limit",maxReq);
            res.setHeader("X-RateLimit-Remaining",maxReq-1); //after first requrst counted
            res.setHeader(
                "X-RateLimit-Reset",
                Math.ceil((currentTime + windowSize)/1000)
            );
            return next();
        }

        const userData=requestStore[ip];
        const timePassed=currentTime - userData.windowStart;

        if(timePassed < windowSize){
            //still within the window
            if(userData.count >= maxReq){
                //exceeded
                return res.status(429).json({
                    message: "Too many Requests. TRY AGAIN LATER."
                });
            }
            userData.count += 1;//didnt exceed=>+1
            //update headers
            res.setHeader("X-RateLimit-Limit", maxReq);
            res.setHeader("X-RateLimit-Remaining", maxReq - userData.count); //remainig requests
            res.setHeader(
                "X-RateLimit-Reset",
                Math.ceil((userData.windowStart + windowSize)/1000)
            );
            return next();
        }
        else{
            //not within the window->RESET
            requestStore[ip]={
                count:1,
                windowStart: currentTime
            };
            res.setHeader("X-RateLimit-Limit", maxReq);
            res.setHeader("X-RateLimit-Remaining", maxReq - 1);
            res.setHeader(
                "X-RateLimit-Reset",
                Math.ceil((currentTime + windowSize) / 1000)
            );
            return next();
        }
    }
}

export {createFixedWindowLimiter};

