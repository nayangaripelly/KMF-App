import mongoose from "mongoose";
const schema = mongoose.Schema;
const objectId = mongoose.Types.ObjectId;

const roles = ['salesperson', 'fieldperson'];

const clientSchema = new schema({
    name : {type: String, require: true},
    phoneNo : {type:String, require:true, unique:true},
    location: {type: String},
    assignedTo: {type: objectId, ref:"users"},
    assignedRole: {type: String, enum: roles, default: 'salesperson'},
    createdAt:{type:String,require:true}
})

export const clientModel = mongoose.model("clients",clientSchema);