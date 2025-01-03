import { Schema } from "mongoose";

export interface IVendor extends Document {
  companyName: string;
  businessLicenseNumber: string;
  address: string;
  contactNumber: string;
  website?: string;
  user?: Schema.Types.ObjectId;
  servicesOffered: string[];
  ratings: number;
  isVerified: boolean;
  establishedYear: number;
  socialMediaLinks?: Map<string, string>;
  taxIdentificationNumber: string;
  logo?: string;
}