import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    numId: {
      type: Number,
      required: true,
      unique: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    items: [
      {
        product: {
          id: SchemaTypeFlexible(),
          _id: String,
          name: String,
          category: String,
          price: Number,
          description: String,
          image: String,
          stock: Number,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

function SchemaTypeFlexible() {
  return mongoose.Schema.Types.Mixed;
}

orderSchema.virtual('id').get(function () {
  return this.numId || this._id.toString();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
