import domain, { Idomain } from "../models/domain";
import organization,{ Iorg } from "../models/organization";
import Bcrypt from "../services/bcrypt";

export default class ctrlAdmin{
    

    /**
     * Admin authenctication
     * @param email 
     * @param password 
     * @returns 
     */
    static async adminAuth(email:string,password:string){

        //Initializing admin credentials
        const admin = {
            email: "admin@gmail.com",
            password: "Admin123"
        }

        //Checking admin authentication
        if(email==admin.email && password == admin.password){
            return {
                //Display success message with email(only)
                success:true,
                email:email
            }
        }else {
            return {
                //Display Invalid credentials if they don't match
                success:false,
                Error:"Invalid Credentials"
            }
        }
    }


    /**
     * Function to create organization by admin
     * @param name 
     * @param email 
     * @param password 
     */
    static async createOrg(name:string,email:string,password:string):Promise<Iorg>{
        const hash = await Bcrypt.hashing(password);
        const org = {
            orgName:name,
            email:email,
            password:hash
        }
        //Store organization in collection
        const data = await organization.create(org);
        return data;
    }

/**
 * Function to create domain by admin
 * @param name 
 */
    static async createDomain(name:any):Promise<Idomain>{
        //Store domain in collection
        return await domain.create(name);
    }

/**
 * Function to find all organizations  
 * @returns 
 */  
    static async findAllOrg():Promise<Iorg[]>{
        return organization.aggregate([
            {$project : {"password" : 0 }}
        ])
    }

/**
 * Function to find all domains
 * @returns 
 */
    static async findAllDomain():Promise<Idomain[]>{
        return domain.find();
    }
}