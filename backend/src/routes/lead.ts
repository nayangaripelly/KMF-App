import express from 'express';
import leadController from '../controllers/lead.js';

const router = express.Router();

// GET /api/v1/leads/:userId
router.get('/:userId', leadController.getLeadsByUserId);

// POST /api/v1/leads
router.post('/', leadController.createLead);

export default router;