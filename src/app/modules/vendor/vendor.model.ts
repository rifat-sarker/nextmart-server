import { Schema, model, Document } from 'mongoose';
import { IVendor } from './vendor.interface';

const vendorSchema = new Schema<IVendor>(
  {
    companyName: {
      type: String,
      required: true,
    },
    businessLicenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^\d{11}$/.test(v);
        },
        message: 'Contact number must be 10 digits long',
      },
      required: true,
    },
    website: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(v);
        },
        message: 'Invalid website URL format.',
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Ensures a one-to-one relationship
    },
    servicesOffered: {
      type: [String],
      required: true, // List of services provided by the vendor
    },
    ratings: {
      type: Number,
      min: 0,
      max: 5,
      default: 0, // Average ratings for the vendor
    },
    isVerified: {
      type: Boolean,
      default: false, // Indicates whether the vendor's details are verified
    },
    establishedYear: {
      type: Number, // Year the vendor's business was established
      required: true,
    },
    socialMediaLinks: {
      type: Map,
      of: String, // Links to social media profiles (e.g., Facebook, Instagram)
    },
    taxIdentificationNumber: {
      type: String,
      required: true, // Vendor's tax ID for legal compliance
      unique: true,
    },
    logo: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^(http(s)?:\/\/.*\.(?:png|jpg|jpeg))/.test(v);
        },
        message: 'Invalid logo URL format.',
      },
    },
  },
  { timestamps: true },
);

const Vendor = model<IVendor>('Vendor', vendorSchema);

export default Vendor;


