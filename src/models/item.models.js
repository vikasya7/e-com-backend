import mongoose, { Schema } from "mongoose";

const variantSchema = new Schema({
  weight: {
    type: String,   // "150g", "200g"
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  }
}, { _id: false });

const itemSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  // Multiple images
  images: [
  {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    }
  }
],

  // Embedded variants
  variants: [variantSchema],

  category: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  },

  rating: {
    type: Number,
    default: 0
  },

  numReviews: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export const Item = mongoose.model("Item", itemSchema);
