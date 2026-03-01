import express from "express";

const app=express();
const PORT=5000;

import testRoutes from "./routes/testRoutes.js";
import limterEngineRoute from "./routes/LimiterEngineRoute.js";

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("API is working");
});

app.use("/api",testRoutes);
app.use("/engine",limterEngineRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});