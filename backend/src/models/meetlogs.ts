import mongoose from "mongoose";

const schema = mongoose.Schema;
const objectId = mongoose.Types.ObjectId;

const meetstatus = ["met","notmet","meet_later"];

const meetlogschema = new schema({
    userId:{type:objectId, ref:"users",require:true},
    clientId:{type:objectId, ref:"clients",require:true},
    meetStatus:{type:String, enum:meetstatus, require:true},
    visitTime:{type:String, require: true},
    distanceTravelled: {type:Number},
    notes:{type:String}
})

export const meetlogModel = mongoose.model("meetlogs",meetlogschema);