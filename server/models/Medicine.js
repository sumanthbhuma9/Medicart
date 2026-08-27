import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    numId: {
      type: Number,
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

medicineSchema.virtual('id').get(function () {
  return this.numId || this._id.toString();
});

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
