
const WINDOW_SIZE=60*1000;//60 seconds window
const MAX_REQ=5;//max allowed requests in that window

//store request data=>in-memory js object
const requestStore ={};

/*
Structure of requestStore:

{
  "ip_address": {
      count: number,  //no of requests in the window
      windowStart: timestamp
  }
}
*/

const fixedWindowLimiter=(req,res,next)=>{
    const ip=req.ip; //identify client ip
    const currentTime= Date.now();
    //if ip has never made a request before
    if(!requestStore[ip]){
        //first req=>start with count=1 and currentime
        requestStore[ip]={
            count: 1,
            windowStart: currentTime
        };
        return next();
    }

    const timePassed= currentTime - requestStore[ip].windowStart;//time from start of window
    //still inside same window
    if(timePassed < WINDOW_SIZE){
        if(requestStore[ip].count >= MAX_REQ){
            //exceeded limit in current window
            return res.status(429).json({
                message : "Too many requests. TRY LATER."
            });
        }
        //not exceeded yet
        requestStore[ip].count += 1;//inc
        return next();
    }
    else{
        //window over->RESET
        requestStore[ip]={
            count: 1,
            windowStart: currentTime
        };
        return next();
    }
};

export {fixedWindowLimiter};



