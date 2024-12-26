import { z } from 'zod';
import { UserRole } from './user.interface';

const clientInfoSchema = z.object({
  device: z.enum(['pc', 'mobile']).optional().default('pc'), // Allow only 'pc' or 'mobile'
  browser: z.string().min(1, 'Browser name is required'),
  ipAddress: z.string().min(1, 'IP address is required'),
  pcName: z.string().optional(), // Optional field
  os: z.string().optional(), // Optional field
  userAgent: z.string().min(1, 'User agent is required'),
});

const userValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum([UserRole.CUSTOMER, UserRole.VENDOR]).default(UserRole.CUSTOMER), // Match enum values in your code
    clientInfo: clientInfoSchema // Nested schema for client info
  })
});

export const UserValidation = {
  userValidationSchema
}
