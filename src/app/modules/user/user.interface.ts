import { Document } from 'mongoose';

// Enum for User Roles
enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

// User Schema Definition
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  clientInfo: {
    device: 'pc' | 'mobile'; // Device type
    browser: string;         // Browser name
    ipAddress: string;       // User IP address
    pcName?: string;         // Optional PC name
    os?: string;             // Optional OS name (Windows, MacOS, etc.)
    userAgent?: string;      // Optional user agent string
  };
  lastLogin: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
