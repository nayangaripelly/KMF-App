import mongoose from "mongoose";
const schema = mongoose.Schema;
const objectId = mongoose.Types.ObjectId;

const loanType = ["personal","business","student","home"];
const loanStatus = ["hot","warm","cold"];

const leadSchema = new schema({
    clientId: {type:objectId, ref:"clients",require:true},
    userId : {type:objectId,ref:"users",require:true},
    loanType: {type:String, enum:loanType, require:true},
    loanStatus :{type:String, enum:loanStatus, require:true},
    createdAt : {type:String, require:true},
    updatedAt : {type:String, require:true}
})

export const leadModel = mongoose.model("leads",leadSchema);