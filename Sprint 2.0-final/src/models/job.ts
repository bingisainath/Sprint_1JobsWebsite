import {Schema,model} from "mongoose";
import { Iorg } from "./organization";
import { Idomain } from "./domain";

//Job interface
export interface Ijob{
    _id:string,
    jobName:string,
    CTC:number,
    vacancies:number,
    orgId: Iorg | string,
    domainId: Idomain | string,
    postedTime:Date
}

//schema for job
const schema = new Schema ({
    jobName: {
        type:String,
        required:true,
    },
    CTC: {
        type:Number,
        required:true,
    },
    vacancies:{
        type:Number,
        required:true,
    },
    orgId:{
        type:Schema.Types.ObjectId,
        ref:"org",
        required:true,
    },
    domainId:{
        type:Schema.Types.ObjectId,
        ref:"domain",
        required:true
    },
    postedTime:{
        type:Date,
        required:true,
    }
})

//exporting job schema
export default model("job",schema);
