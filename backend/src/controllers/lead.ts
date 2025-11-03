import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { leadModel } from '../models/lead.js';

export const getLeadsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log(`[GET /api/v1/leads/${userId}] Fetching leads for user:`, userId);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const leads = await leadModel.find({ userId: userObjectId }).populate('clientId').exec();
    console.log(`[GET /api/v1/leads/${userId}] Found ${leads.length} leads`);

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, loanType, loanStatus, userId } = req.body;
    
    console.log('[POST /api/v1/leads] Creating lead:', { clientId, loanType, loanStatus, userId });

    if (!clientId || !loanType || !loanStatus || !userId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: clientId, loanType, loanStatus, userId',
      });
      return;
    }

    const now = Date.now().toString();
    const clientObjectId = new mongoose.Types.ObjectId(clientId);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const lead = await leadModel.create({
      clientId: clientObjectId,
      userId: userObjectId,
      loanType,
      loanStatus,
      createdAt: now,
      updatedAt: now,
    });

    const populatedLead = await leadModel.findById(lead._id).populate('clientId').exec();

    console.log('[POST /api/v1/leads] Lead created successfully:', lead._id);

    res.status(201).json({
      success: true,
      data: populatedLead,
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const leadController = {
  getLeadsByUserId,
  createLead,
};

export default leadController;