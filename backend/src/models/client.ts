import mongoose from "mongoose";
const schema = mongoose.Schema;
const objectId = mongoose.Types.ObjectId;

const clientSchema = new schema({
    name : {type: String, require: true},
    phoneNo : {type:String, require:true, unique:true},
    location: {type: String},
    assignedTo: {type: objectId, ref:"users"},
    createdAt:{type:String,require:true}
})

export const clientModel = mongoose.model("clients",clientSchema);