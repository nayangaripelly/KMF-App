import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { clientModel } from '../models/client.js';

export const getClientsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    console.log(`[GET /api/v1/clients/${userId}] Fetching clients for user:`, userId);

    // Convert userId string to ObjectId for proper querying
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const clients = await clientModel.find({ assignedTo: userObjectId }).exec();
    console.log(`[GET /api/v1/clients/${userId}] Found ${clients.length} clients`);

    // If no clients found, seed mock clients
    // if (clients.length === 0) {
    //   console.log(`[GET /api/v1/clients/${userId}] No clients found, seeding mock data...`);
    //   await seedMockClients(userId as string);
    //   // Fetch again after seeding
    //   const seededClients = await clientModel.find({ assignedTo: userObjectId }).exec();
    //   console.log(`[GET /api/v1/clients/${userId}] After seeding, found ${seededClients.length} clients`);
      
    //   res.status(200).json({
    //     success: true,
    //     count: seededClients.length,
    //     data: seededClients,
    //   });
    //   return;
    // }

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createClient = async (req:Request, res:Response) :Promise<void> => {
  const {name,phone,location,salespersonId, fieldPersonId, assignedUserId, assignedRole} = req.body;
  console.log(req.body);
  try 
  {
    const assigneeId = assignedUserId || fieldPersonId || salespersonId;
    if (!assigneeId) {
      res.status(400).json({
        success: false,
        msg: 'Missing assignee id',
      });
      return;
    }

    const normalizedRole = assignedRole
      ? assignedRole
      : fieldPersonId
      ? 'fieldperson'
      : 'salesperson';

    const response = await clientModel.create({
      name,
      phoneNo:phone,
      location,
      createdAt: Date.now().toString(),
      assignedTo: assigneeId,
      assignedRole: normalizedRole
    })
    res.status(200).json({
      msg:"sucessfully added a new client",
      success:true,
      data: response
    })
  }catch(e)
  {
    res.status(404).json({
      msg:"something went wrong. Client didn't get added",
    })
  }
}
// export const seedMockClients = async (userId: string): Promise<void> => {
//   try {
//     const userObjectId = new mongoose.Types.ObjectId(userId);
//     const mockClients = [
//       { name: 'John Anderson', phoneNo: '5551234567', location: 'New York', assignedTo: userObjectId },
//       { name: 'Sarah Mitchell', phoneNo: '5552345678', location: 'Los Angeles', assignedTo: userObjectId },
//       { name: 'Michael Chen', phoneNo: '5553456789', location: 'Chicago', assignedTo: userObjectId },
//     ];

//     // Use a combination of phoneNo and assignedTo to ensure uniqueness per user
//     for (const client of mockClients) {
//       await clientModel.findOneAndUpdate(
//         { phoneNo: client.phoneNo, assignedTo: userObjectId },
//         { ...client, createdAt: Date.now().toString() },
//         { upsert: true, new: true }
//       );
//     }

//     console.log(`[SEED] Created ${mockClients.length} mock clients for user:`, userId);
//   } catch (error) {
//     console.error('Error seeding mock clients:', error);
//     throw error;
//   }
// };

export const clientController = {
  getClientsByUserId,
  createClient
  // seedMockClients,
};

export default clientController;
