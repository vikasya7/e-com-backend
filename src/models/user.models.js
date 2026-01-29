import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter valid email"]
    },

    password: {
      type: String,
      required: [true, "password is required"]
    },

    avatar: {
      type: String
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    }
  },
  { timestamps: true }
);


// 🔐 hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// 🔐 compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


export const User = mongoose.model("User", userSchema);

