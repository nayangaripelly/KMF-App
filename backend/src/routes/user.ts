import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
// import { seedMockClients } from "../controllers/client.js";
import { userModel } from "../models/user.js";
dotenv.config();
const userRouter = Router();

const jwtsecret = process.env.JWT_SECRET as string;

// Middleware to verify JWT token
interface AuthRequest extends Request {
  userId?: string;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtsecret) as { id: string };
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

userRouter.post("/signup",async function(req, res)
{
    const {username, emailId, password, role} = req.body;
    const hash = await bcrypt.hash(password,5);
    try
    {
        const user = await userModel.create({
            username,
            emailId,
            passwordhash:hash,
            role,
            createdAt:Date.now()
        });
        
        // Seed mock clients for salesperson role
        // if (role === 'salesperson' && user._id) {
        //     await seedMockClients(user._id.toString());
        // }
        
        res.status(201).json({
            msg:"user successfully created!!"
        })
    }catch(e)
    {
        res.status(409).json({
            msg:"account with email already exists or something went wrong try again"
        })
    }
});

userRouter.post("/signin",async function(req,res)
{
    console.log(req.body);
    const {emailId, password} = req.body;
    try
    {
        const user = await userModel.findOne({emailId});
        if(!user)
        {
            res.status(404).json({
                msg:"user doesn't exist, incorrect emailId",
            });
            return;
        }
      
        const hash = user?.passwordhash as string;
        const match = await bcrypt.compare(password,hash);
        if(!match)
        {
            res.status(401).json({
                msg:"incorrect credentials"
            });
            return;
        }
        
        console.log(jwtsecret);
        const token = jwt.sign({
            id:user?._id
        },jwtsecret);
        
        res.status(200).json({
            token
        });
    }catch(e)
    {
        res.json({
            msg:"something went wrong try again"
        })
    }
});

// Get user info endpoint
userRouter.get("/me", verifyToken, async function(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ msg: 'User ID not found' });
        }

        const user = await userModel.findById(userId).select('-passwordhash');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id.toString(),
                username: user.username,
                emailId: user.emailId,
                role: user.role,
                createdAt: user.createdAt?.toString(),
            }
        });
    } catch (e) {
        console.error('Error fetching user info:', e);
        res.status(500).json({
            msg: "something went wrong try again"
        });
    }
});

// Change password endpoint
userRouter.post("/change-password", verifyToken, async function(req: AuthRequest, res: Response) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ msg: 'User ID not found' });
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                success: false,
                msg: 'All password fields are required' 
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ 
                success: false,
                msg: 'New password must be at least 8 characters long' 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: false,
                msg: 'New password and confirm password do not match' 
            });
        }

        // Get user with password hash
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                msg: 'User not found' 
            });
        }

        // Verify current password
        const hash = user.passwordhash as string;
        const match = await bcrypt.compare(currentPassword, hash);
        if (!match) {
            return res.status(401).json({ 
                success: false,
                msg: 'Current password is incorrect' 
            });
        }

        // Hash new password
        const newHash = await bcrypt.hash(newPassword, 5);

        // Update password in database
        user.passwordhash = newHash;
        await user.save();

        res.status(200).json({
            success: true,
            msg: 'Password updated successfully'
        });
    } catch (e) {
        console.error('Error changing password:', e);
        res.status(500).json({
            success: false,
            msg: "Something went wrong. Please try again."
        });
    }
});

interface AuthRequest extends Request {
    userId?: string;
}

userRouter.get("/salespersons",verifyToken, async function(req :AuthRequest, res:Response) {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ msg: 'User ID not found' });
    }
    try {
        const user = await userModel.find({role:"salesperson"});
        if (user.length === 0) {
            return res.status(404).json({ msg: 'salespersons not found' });
        }
        const salespersons = await userModel.find({role: "salesperson"});
        console.log("from /salesperson route");
        console.log(salespersons);
        res.status(200).json({
            success: true,
            salespersons : salespersons
        });
    } catch (e) {
        console.error('Error fetching salespersons:', e);
        res.status(500).json({
            success: false,
            msg: "Something went wrong. Please try again."
        });
    }
});

userRouter.get("/fieldpersons", verifyToken, async function(req: AuthRequest, res: Response) {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ msg: 'User ID not found' });
    }
    try {
        const fieldpersons = await userModel.find({ role: "fieldperson" });
        res.status(200).json({
            success: true,
            fieldpersons
        });
    } catch (e) {
        console.error('Error fetching fieldpersons:', e);
        res.status(500).json({
            success: false,
            msg: "Something went wrong. Please try again."
        });
    }
});
export default userRouter;