import {Schema,model} from "mongoose";
import { Ijob } from "./job";

//Applicant interface
export interface Iapplicant{
    _id:string,
    name:string,
    email:string,
    password:string,
    selected:boolean,
    jobRef: Ijob | string,
}


//Applicant schema
const schema = new Schema ({
    name:{
        type:String,
        required:true,
    },
    email: {
        type:String,
        required:true,
        unique:true,
    },
    password: {
        type:String,
        required:true,
    },
    Selected:{
        type:Boolean,
        default:false
    },
    jobRef:{
        type:Schema.Types.ObjectId,
        ref:"jobs",
    }

})


//exporting applicant schema
export default model("applicant",schema);
