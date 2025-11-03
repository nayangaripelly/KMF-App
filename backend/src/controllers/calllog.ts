import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { calllogModel } from '../models/call_logs.js';

export const getCallLogsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log(`[GET /api/v1/calllogs/${userId}] Fetching call logs for user:`, userId);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const callLogs = await calllogModel.find({ userId: userObjectId }).populate('clientId').sort({ calledTime: -1 }).exec();
    console.log(`[GET /api/v1/calllogs/${userId}] Found ${callLogs.length} call logs`);

    res.status(200).json({
      success: true,
      count: callLogs.length,
      data: callLogs,
    });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching call logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createCallLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, status, callType, duration, calledTime, note, userId } = req.body;
    
    console.log('[POST /api/v1/calllogs] Creating call log:', {
      clientId,
      status,
      callType,
      duration,
      calledTime,
      note,
      userId,
    });

    if (!clientId || !status || !callType || !calledTime || !userId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: clientId, status, callType, calledTime, userId',
      });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const clientObjectId = new mongoose.Types.ObjectId(clientId);
    const callLog = await calllogModel.create({
      userId: userObjectId,
      clientId: clientObjectId,
      status,
      callType,
      duration,
      calledTime,
      note,
    });

    const populatedCallLog = await calllogModel.findById(callLog._id).populate('clientId').exec();

    console.log('[POST /api/v1/calllogs] Call log created successfully:', callLog._id);

    res.status(201).json({
      success: true,
      data: populatedCallLog,
    });
  } catch (error) {
    console.error('Error creating call log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating call log',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const calllogController = {
  getCallLogsByUserId,
  createCallLog,
};

export default calllogController;
