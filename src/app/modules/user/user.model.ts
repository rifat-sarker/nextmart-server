import mongoose, { Schema } from 'mongoose';
import { IUser, UserModel, UserRole } from './user.interface';
import bcrypt from 'bcrypt';
import config from '../../config';

// Create the User schema based on the interface
const userSchema = new Schema<IUser, UserModel>(
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


userSchema.pre('save', async function (next) {
  const user = this; // doc

  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );

  next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});


userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// Create and export the User model
const User = mongoose.model<IUser, UserModel>('User', userSchema);
export default User;
