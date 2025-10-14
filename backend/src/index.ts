import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
const app = express();

app.use(express.json());
app.use("/api/v1/users",userRouter);

dotenv.config();
const mongourl = process.env.MONGODB_URL as string;
async function main()
{
    await mongoose.connect(mongourl);
    app.listen(3000);
}

main();