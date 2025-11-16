import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
const jwtsecret = process.env.JWT_SECRET as string;

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ msg: 'No token provided' });
    }
    const decoded = jwt.verify(token, jwtsecret) as { id: string, role: string };
    if (decoded.role !== 'admin') {
        return res.status(401).json({ msg: 'Unauthorized' });
    }
    next();
};