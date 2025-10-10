import mongoose from "mongoose";
const schema = mongoose.Schema;

const roles = ["salesperson", "fieldperson","admin"]

const userSchema = new schema({
    username : {type: String, require: true},
    emailId : {type:String, require:true, unique:true},
    passwordhash: {type:String, require: true},
    role: {type:String, enum:roles, require:true},
    createdAt:{type:String,require:true}
})

export const userModel = mongoose.model("users",userSchema);