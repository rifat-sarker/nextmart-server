import { Schema, model, Document } from 'mongoose';
import { ICustomer } from './customer.interface';

const customerSchema = new Schema<ICustomer>({
  phoneNo: {
    type: String,
    validate: {
      validator: function (v: string) {
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be 10 digits long',
    },
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Other',
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    home: {
      type: String,
    },
    work: {
      type: String,
    },
    partner: {
      type: String,
    },
    other: {
      type: String,
    },
  },
  photo: {
    type: String,
    validate: {
      validator: function (v: string) {
        return /^(http(s)?:\/\/.*\.(?:png|jpg|jpeg))/.test(v);
      },
      message: 'Invalid photo URL format.',
    },
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

const Customer = model<ICustomer>('Customer', customerSchema);

export default Customer;
