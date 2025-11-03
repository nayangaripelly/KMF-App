import express from 'express';
import statisticsController from '../controllers/statistics.js';

const router = express.Router();

// GET /api/v1/statistics/:userId
router.get('/:userId', statisticsController.getStatisticsByUserId);

export default router;
