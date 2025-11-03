import mongoose from "mongoose";
const schema = mongoose.Schema;
const objectId = mongoose.Types.ObjectId;

const statusType = ["connected","rejected","followup","missed"];
const callTypeEnum = ["incoming","outgoing","missed"];

const calllogSchema = new schema({
    userId : {type: objectId, ref:"users",require: true},
    clientId : {type:objectId, ref:"clients",require:true},
    status: {type: String, enum:statusType, require:true},
    callType: {type: String, enum:callTypeEnum, require:true},
    duration: {type: String},
    calledTime: {type:String,require:true},
    note: {type:String}
})

export const calllogModel = mongoose.model("calllogs",calllogSchema);