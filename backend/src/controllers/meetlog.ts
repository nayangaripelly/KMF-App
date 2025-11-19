import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { meetlogModel } from '../models/meetlogs.js';

const MEET_STATUSES = ['met', 'notmet', 'meetagain'];

const buildMeetStatusSummary = () => ({
  met: 0,
  notmet: 0,
  meetagain: 0,
});

export const createMeetLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, fieldPersonId, meetStatus, distanceTravelled, timestamp, notes } = req.body;

    if (!clientId || !fieldPersonId || !meetStatus) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: clientId, fieldPersonId, meetStatus',
      });
      return;
    }

    if (!MEET_STATUSES.includes(meetStatus)) {
      res.status(400).json({
        success: false,
        message: `Invalid meet status. Allowed values: ${MEET_STATUSES.join(', ')}`,
      });
      return;
    }

    const payload = {
      clientId: new mongoose.Types.ObjectId(clientId),
      fieldPersonId: new mongoose.Types.ObjectId(fieldPersonId),
      meetStatus,
      distanceTravelled: typeof distanceTravelled === 'number' ? distanceTravelled : undefined,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      notes,
    };

    const meetLog = await meetlogModel.create(payload);
    const populatedMeetLog = await meetlogModel
      .findById(meetLog._id)
      .populate('clientId')
      .populate('fieldPersonId', 'username emailId role')
      .exec();

    res.status(201).json({
      success: true,
      data: populatedMeetLog,
    });
  } catch (error) {
    console.error('[MEETLOG] Error creating meet log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating meet log',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getMeetLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fieldPersonId, clientId, meetStatus } = req.query;
    const filters: Record<string, unknown> = {};

    if (fieldPersonId) {
      filters.fieldPersonId = new mongoose.Types.ObjectId(fieldPersonId as string);
    }
    if (clientId) {
      filters.clientId = new mongoose.Types.ObjectId(clientId as string);
    }
    if (meetStatus && MEET_STATUSES.includes(meetStatus as string)) {
      filters.meetStatus = meetStatus;
    }

    const meetLogs = await meetlogModel
      .find(filters)
      .populate('clientId')
      .populate('fieldPersonId', 'username emailId role')
      .sort({ timestamp: -1 })
      .exec();

    res.status(200).json({
      success: true,
      count: meetLogs.length,
      data: meetLogs,
    });
  } catch (error) {
    console.error('[MEETLOG] Error fetching meet logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meet logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getMeetLogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Missing meet log id',
      });
      return;
    }

    const meetLog = await meetlogModel
      .findById(new mongoose.Types.ObjectId(id))
      .populate('clientId')
      .populate('fieldPersonId', 'username emailId role')
      .exec();

    if (!meetLog) {
      res.status(404).json({
        success: false,
        message: 'Meet log not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: meetLog,
    });
  } catch (error) {
    console.error('[MEETLOG] Error fetching meet log by id:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meet log',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getMeetLogStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fieldPersonId } = req.query;

    if (!fieldPersonId) {
      res.status(400).json({
        success: false,
        message: 'fieldPersonId query parameter is required',
      });
      return;
    }

    const fieldPersonObjectId = new mongoose.Types.ObjectId(fieldPersonId as string);

    const [totalMeets, statusAggregation] = await Promise.all([
      meetlogModel.countDocuments({ fieldPersonId: fieldPersonObjectId }).exec(),
      meetlogModel
        .aggregate([
          { $match: { fieldPersonId: fieldPersonObjectId } },
          { $group: { _id: '$meetStatus', count: { $sum: 1 } } },
        ])
        .exec(),
    ]);

    const summary = buildMeetStatusSummary();
    statusAggregation.forEach(({ _id, count }) => {
      if (_id && typeof summary[_id as keyof typeof summary] === 'number') {
        summary[_id as keyof typeof summary] = count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalMeets,
        meetStatusCounts: summary,
      },
    });
  } catch (error) {
    console.error('[MEETLOG] Error fetching meet log statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meet log statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export default {
  createMeetLog,
  getMeetLogById,
  getMeetLogs,
  getMeetLogStatistics,
};

