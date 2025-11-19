import express from 'express';
import meetlogController from '../controllers/meetlog.js';

const router = express.Router();

// POST /api/v1/fieldperson/meetlogs
router.post('/', meetlogController.createMeetLog);

// GET /api/v1/fieldperson/meetlogs/statistics?fieldPersonId=123
router.get('/statistics', meetlogController.getMeetLogStatistics);

// GET /api/v1/fieldperson/meetlogs
router.get('/', meetlogController.getMeetLogs);

// GET /api/v1/fieldperson/meetlogs/:id
router.get('/:id', meetlogController.getMeetLogById);

export default router;

