import {Schema,model} from "mongoose";
import { Iorg } from "./organization";
import { Iapplicant } from "./applicant";
import { Ijob } from "./job";

//Applied jobs Interface
export interface IappliedJob{
    _id:string,
    applicantId: Iapplicant | string ,  // refering the Iapplicant interface and storing the _id(applicant) in string format
    orgId: Iorg | string,
    jobId : Ijob | string,
}

//Applied jobs schema
const schema = new Schema ({
    applicantId:{
        type:Schema.Types.ObjectId,
        ref:"applicant",
        required:true,
    },
    orgId: {
        type:Schema.Types.ObjectId,
        ref:"org",
        required:true,
    },
    jobId: {
        type:Schema.Types.ObjectId,
        ref:"job",
        required:true,
    }
})

//exporting applied jobs schema
export default model("appliedJob",schema);
