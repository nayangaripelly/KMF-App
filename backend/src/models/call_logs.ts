import mongoose from "mongoose";
const schema = mongoose.Schema;
const objectId = mongoose.Types.ObjectId;

const statusType = ["connected","rejected","followup","missed"];

const calllogSchema = new schema({
    userId : {type: objectId, ref:"users",require: true},
    clientId : {type:objectId, ref:"clients",require:true},
    status: {type: String, enum:statusType, require:true},
    calledTime: {type:String,require:true},
    note: {type:String}
})

export const calllogModel = mongoose.model("calllogs",calllogSchema);