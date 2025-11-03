import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { seedMockClients } from "../controllers/client.js";
import { userModel } from "../models/user.js";
dotenv.config();
const userRouter = Router();

const jwtsecret = process.env.JWT_SECRET as string;
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
        if (role === 'salesperson' && user._id) {
            await seedMockClients(user._id.toString());
        }
        
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




export default userRouter;