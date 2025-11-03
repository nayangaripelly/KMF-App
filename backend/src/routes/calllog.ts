import express from 'express';
import calllogController from '../controllers/calllog.js';

const router = express.Router();

// GET /api/v1/calllogs/:userId
router.get('/:userId', calllogController.getCallLogsByUserId);

// POST /api/v1/calllogs
router.post('/', calllogController.createCallLog);

export default router;
