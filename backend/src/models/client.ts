import mongoose from "mongoose";
const schema = mongoose.Schema;


const clientSchema = new schema({
    name : {type: String, require: true},
    phoneNo : {type:String, require:true, unique:true},
    location: {type: String},
    createdAt:{type:String,require:true}
})

export const clientModel = mongoose.model("clients",clientSchema);