import { Schema, model, Document } from 'mongoose';

export interface IBrandModel extends Document {
  name: string;
  // add more fields here
}

const brandSchema = new Schema<IBrandModel>({
  name: { type: String, required: true },
  // add more fields here
});

const brandModel = model<IBrandModel>('Brand', brandSchema);

export default brandModel;
