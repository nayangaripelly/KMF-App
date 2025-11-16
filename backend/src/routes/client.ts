import express from 'express';
import clientController from '../controllers/client.js';

const router = express.Router();

// GET /api/v1/clients/:userId
router.get('/:userId', clientController.getClientsByUserId);

// POST /api/v1/clients
router.post('/',clientController.createClient);

// POST /api/v1/clients/:userId/seed - Manual seed endpoint
// router.post('/:userId/seed', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     console.log(`[POST /api/v1/clients/${userId}/seed] Seeding mock clients...`);
//     await clientController.seedMockClients(userId);
//     res.status(200).json({
//       success: true,
//       message: 'Mock clients seeded successfully',
//     });
//   } catch (error) {
//     console.error('Error in seed endpoint:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error seeding mock clients',
//       error: error instanceof Error ? error.message : 'Unknown error',
//     });
//   }
// });

export default router;
