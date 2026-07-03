import mongoose from "mongoose"

 const userSchema= new mongoose.Schema({
     googleId: { type: String, required: false },
   name: { type: String, required: true },
   email: { type: String, required: true, unique: true },
   password: { type: String, required: false },
   picture: String,
   given_name: String
}, { timestamps: true });
 
const User=mongoose.model("User",userSchema);
export default User