
import {Schema,model} from "mongoose";
import { Iapplicant } from "./applicant";
import { Iorg } from "./organization";

//Selected applicants Interface
export interface Iselect{
    _id:string,
    applicantId: Iapplicant | string ,
    orgId: Iorg | string,
}

//schema for selected applicants
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
    }
})

//exporting selected applicants schema
export default model("selectedApplicant",schema);
