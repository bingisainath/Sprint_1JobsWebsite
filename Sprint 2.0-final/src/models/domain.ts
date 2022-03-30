import {Schema,model} from "mongoose";

//Domain interface
export interface Idomain{
    _id:string,
    domainName:string
}

//Domain schema
const schema = new Schema ({
    domainName: {
        type:String,
        required:true,
        unique:true,
    }
})

//exporting domain schema
export default model("domain",schema);
