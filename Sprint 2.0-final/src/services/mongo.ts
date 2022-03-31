//importing connect from mongoose
import {connect} from "mongoose";


//Connecting the Mongodb sever
export default class Mongo{

    //connecting the mongo by using connect function
    static async connect():Promise<boolean>{

        //using connect default method
        await connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
        return true;
    }
}