import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const userSchema= new Schema(
    {
        address: {
          street: String,
          city: String,
          state: String,
          pincode: String,
          country: String
        },
        email: {
            type: String,
            required: true,
            unique:true,
            lowercase:true,
            trim: true
        },
        fullname: {
            type: String,
            required:true,
            trim:true,
            index:true,
        },
        avatar: {
            type: String
        },
        password: {
           type:String,
           required: [true,"password is required"]
        },
        role: {
             type: String,
             enum: ["user", "admin"],
             default: "user"
         },


    },{timestamps:true}
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
};

export const User =mongoose.model("User",userSchema)