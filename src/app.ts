import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import os from 'os';
import { StatusCodes } from 'http-status-codes';


const app: Application = express();

// Middleware setup
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Test route
app.get('/', (req: Request, res: Response, next: NextFunction) => {

    const currentDateTime = new Date().toISOString();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const serverHostname = os.hostname();
    const serverPlatform = os.platform();
    const serverUptime = os.uptime();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Welcome to the School Management API',
        description: 'This API supports comprehensive management of school operations, including handling students, teachers, classes, and schedules.',
        version: '1.0.0',
        clientDetails: {
            ipAddress: clientIp,
            accessedAt: currentDateTime,
        },
        serverDetails: {
            hostname: serverHostname,
            platform: serverPlatform,
            uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor((serverUptime / 60) % 60)} minutes`,
        },
        developerContact: {
            email: 'fahimfiroz.ph@gmail.com',
            website: 'https://programming-hero.com',
        },
    });
});


export default app; // Export the app for use in server.ts