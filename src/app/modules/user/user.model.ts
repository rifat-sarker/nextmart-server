import mongoose, { Schema } from 'mongoose';
import { IUser } from './user.interface';

// Define the UserRole enum
enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

// Create the User schema based on the interface
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [UserRole.ADMIN, UserRole.VENDOR, UserRole.CUSTOMER],
      default: UserRole.CUSTOMER,
    },
    clientInfo: {
      device: {
        type: String,
        enum: ['pc', 'mobile'],
        required: true,
      },
      browser: {
        type: String,
        required: true,
      },
      ipAddress: {
        type: String,
        required: true,
      },
      pcName: {
        type: String, // Optional field for PC name
      },
      os: {
        type: String, // Optional field for operating system name
      },
      userAgent: {
        type: String, // Optional field for user agent string
      },
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create and export the User model
const User = mongoose.model<IUser>('User', userSchema);
export default User;
