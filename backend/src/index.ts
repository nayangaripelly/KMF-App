import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import calllogRouter from "./routes/calllog.js";
import clientRouter from "./routes/client.js";
import leadRouter from "./routes/lead.js";
import meetlogRouter from "./routes/meetlog.js";
import statisticsRouter from "./routes/statistics.js";
import userRouter from "./routes/user.js";

// Load environment variables first
dotenv.config();

const app = express();

// Enable CORS for all origins (configure as needed for production)
app.use(cors({
  origin: '*', // In production, specify your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/leads", leadRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/calllogs", calllogRouter);
app.use("/api/v1/fieldperson/meetlogs", meetlogRouter);
app.use("/api/v1/statistics", statisticsRouter);

const mongourl = process.env.MONGODB_URL as string;
async function main()
{
    await mongoose.connect(mongourl);
    console.log('[SERVER] Connected to MongoDB');
    app.listen(3003,'0.0.0.0', () => {
        console.log('[SERVER] Backend server running on port 3003');
        console.log('[SERVER] Available endpoints:');
        console.log('  - POST /api/v1/users/signup');
        console.log('  - POST /api/v1/users/signin');
        console.log('  - GET  /api/v1/clients/:userId');
        console.log('  - GET  /api/v1/leads/:userId');
        console.log('  - POST /api/v1/leads');
        console.log('  - GET  /api/v1/calllogs/:userId');
        console.log('  - POST /api/v1/calllogs');
        console.log('  - POST /api/v1/fieldperson/meetlogs');
        console.log('  - GET  /api/v1/fieldperson/meetlogs');
        console.log('  - GET  /api/v1/fieldperson/meetlogs/:id');
        console.log('  - GET  /api/v1/fieldperson/meetlogs/statistics?fieldPersonId=');
        console.log('  - GET  /api/v1/statistics/:userId');
    });
}

main().catch((error) => {
    console.error('[SERVER] Failed to start:', error);
});