import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
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

     addresses: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true
        },
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: "India" },
        landmark: String,
        isDefault: { type: Boolean, default: false }
      }
    ],
    provider:{
      type:String,
      enum:["local","google"],
      default:"local"
    },
    googleId:{
       type:String
    },
    refreshToken: {
        type: String
    }
  },
  { timestamps: true }
);


// 🔐 hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return ;

  this.password = await bcrypt.hash(this.password, 10);
  //next();
});


// 🔐 compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken=function(){
   return jwt.sign({
    _id:this._id,
    email:this.email,
    username:this.username,
    fullname: this.fullname
   },process.env.ACCESS_TOKEN_SECRET,{
    expiresIn:process.env.ACCESS_TOKEN_SECRET_EXIT
   })
}


userSchema.methods.generateRefreshToken=function(){
   return jwt.sign({
    _id:this._id,
   },process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:process.env.REFRESH_TOKEN_SECRET_EXIT
   }
  )
}




export const User = mongoose.model("User", userSchema);

