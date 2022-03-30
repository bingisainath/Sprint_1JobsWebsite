
//importing the config,mongo,server packages
import "dotenv/config";

import Mongo from "./services/mongo";
import Server from "./services/server";

//creating the anonymous function for connection mongo and string the express server
(async ()=>{
    try{
        //connect the mongo databaseby calling the connect function method in server
        await Mongo.connect();

        //starting the express server by calling the start function method in server
        await new Server().start();
    }catch(error){
        //throwing the error if the something goes wrong
        console.log(error)
        process.exit();
    }
})();