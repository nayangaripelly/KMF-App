import mongoose from "mongoose";

const schema = mongoose.Schema;
const objectId = mongoose.Types.ObjectId;

const timespan = ["today","this_week","this_month","this_year","All_time"];

const statisticsSchema = new schema({
    userId:{type:objectId, ref:"users", require:true},
    timespan:{type:String, enum:timespan, require:true},
    callsDone:{type:Array}, // array of size 5 today, this_week, this_month, this_year
    visitsDone:{type:Array},
    loansConverted: {type:Array, require:true},
    distanceTravelled: {type:Array, },
    goal: {type:Number}  
})

export const statisticsModel = mongoose.model("statistics",statisticsSchema);