import {Schema,model} from "mongoose";

//Organization Interface
export interface Iorg{
    _id:string,
    orgName:string,
    email:string,
    password:string,
}

//Organization schema
const schema = new Schema ({
    orgName: {
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password: {
        type:String,
        required:true,
    }
})

//exporting organization schema
export default model("org",schema);
