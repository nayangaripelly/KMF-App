import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { calllogModel } from '../models/call_logs.js';
import { leadModel } from '../models/lead.js';
import { meetlogModel } from '../models/meetlogs.js';

export const getStatisticsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log(`[GET /api/v1/statistics/${userId}] Fetching statistics for user:`, userId);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get total calls
    const totalCalls = await calllogModel.countDocuments({ userId: userObjectId }).exec();

    // Get leads grouped by status
    const [hotLeads, warmLeads, coldLeads] = await Promise.all([
      leadModel.countDocuments({ userId: userObjectId, loanStatus: 'hot' }).exec(),
      leadModel.countDocuments({ userId: userObjectId, loanStatus: 'warm' }).exec(),
      leadModel.countDocuments({ userId: userObjectId, loanStatus: 'cold' }).exec(),
    ]);

    // counting total meets and by status for field personnel
    const [totalMeets, meetStatusAggregation] = await Promise.all([
      meetlogModel.countDocuments({ fieldPersonId: userObjectId }).exec(),
      meetlogModel
        .aggregate([
          { $match: { fieldPersonId: userObjectId } },
          { $group: { _id: '$meetStatus', count: { $sum: 1 } } },
        ])
        .exec(),
    ]);

    const meetStatusCounts = {
      met: 0,
      notmet: 0,
      meetagain: 0,
    };

    meetStatusAggregation.forEach(({ _id, count }) => {
      if (_id && meetStatusCounts.hasOwnProperty(_id)) {
        meetStatusCounts[_id as keyof typeof meetStatusCounts] = count;
      }
    });

    const statistics = {
      totalCalls,
      totalMeets,
      hotLeads,
      warmLeads,
      coldLeads,
      meetStatusCounts,
    };

    console.log(`[GET /api/v1/statistics/${userId}] Statistics:`, statistics);

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const statisticsController = {
  getStatisticsByUserId,
};

export default statisticsController;
