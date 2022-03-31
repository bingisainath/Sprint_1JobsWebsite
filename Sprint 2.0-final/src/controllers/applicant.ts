
import applicant,{Iapplicant} from "../models/applicant"
import appliedJob from "../models/appliedJob";
import domain, { Idomain } from "../models/domain";
import jobs, { Ijob } from "../models/job";
import mongoose from "mongoose";
import Bcrypt from "../services/bcrypt";


export default class ctrlApplicant{
    
    /**
     * Function to create applicant profile
     * @param body 
     * @returns 
     */
    static async createAcc(body:any):Promise<Iapplicant>{
        const hash = await Bcrypt.hashing(body.password)
        const data = {
                ...body,
                password: hash
        }
        return applicant.create(data);
    }

    /**
     * Function to authenticate applicant
     * @param body 
     * @returns 
     */
    static async appAuth(body:any):Promise<Iapplicant>{
        const email = body.email;
        const password = body.password;
        //finding the applicant details by email for authentication
        const app = await applicant.findOne({ email : email });

        //checing the user exists or not
        if(app) {
            const result = await Bcrypt.comparing(password,app.password)
            //verifying the password
            if(result)
                return app;
            else throw Error("Enter correct password")
        }
        else throw Error("Invalid Credentials")
    }



    static async profile(userId){
        //const userData = applicant.findOne({_id:userId})
        const userData = applicant.aggregate([
            {
                //matching the _id with userid
                $match:{
                    "_id" : new mongoose.Types.ObjectId(userId)
                }
            },
            {
                //adding lookup for to print all data of job
                $lookup:{
                    from: "jobs",
                    localField:"jobRef",
                    foreignField:"_id",
                    as:"jobRef"
                },
                
            },
            //adding project aggregate to hide confidential dataa
            { "$project": { "password": 0 , "__v":0, "jobRef.__v":0, "jobRef.vacancies":0}}
        ]).exec()
        return userData;
    }

    /**
     * Function to find Domains
     * @param limit 
     * @param page 
     * @param sort 
     */
    static async findDomain(limit,page,sort):Promise<Idomain[]>{
        
        const result = await domain.aggregate([
            //Defining page number
            {
                $skip: page * limit,
            },
            //Defining number of entries per page
            {
                $limit: limit,
            },
            //Sorting results by domainName
            {
                $sort: { domainName : sort }
            }
        ])
        return result;
    }
    /**
     * Function to find all jobs
     * @param limit 
     * @param page 
     * @param filterBy 
     * @param sort 
     */
    static async findAllJob(limit,page,filterBy,sort):Promise<Ijob[]>{

        //Dynamic variable allocation for parameter filterBy
        var sort1 = { $sort: {} }
        sort1["$sort"][filterBy] = sort
        const result = await jobs.aggregate([

            //Defining page number and per page limit
            {
                $match :{vacancies: {$gt: 0 }} ,
            },
            //Defining page number how many pages has to display 
            {
                $skip: page * limit,
            },
            //Defining number of entries per page
            {
                $limit: limit,
            },
            //sorting
            sort1,
            {
                //Finding org and domain object references with their Ids
                $lookup : {
                    from : "orgs",
                    localField :"orgId",
                    foreignField:"_id",
                    as :"orgId"
                }
            },
            {
                $lookup : {
                    from : "domains",
                    localField :"domainId",
                    foreignField:"_id",
                    as :"domainId"
                }
            },
            //adding project aggregate to hide confidential dataa
            { "$project": { "orgId.password": 0 , "__v":0, "orgId.__v":0, "domainId.__v":0}}
        ])
        return result;
    }
    
    /**
     * Function for applicant to apply for job
     * @param body 
     * @param user 
     */
    static async applyJob(body,user){
        const jobId=body.jobId;
        const jobDetails = await jobs.findOne({_id:new mongoose.Types.ObjectId(jobId)})
        //Finding jobseeker profile
        const appdata = await applicant.findOne( {_id :new mongoose.Types.ObjectId(user)} );

        //Checking if the applicant has already been selected
        if(appdata.Selected==false){
            const data = {
                applicantId:user,
                orgId:jobDetails.orgId,
                ...body
            }

            //Pushing jobseeker profile to applied job collection
            const result = await appliedJob.create(data);

            //returing the result
            return {success:true,
            email: appdata.email,
            message:"Successfully applied for the job"
            };

            //Error message if the applicant is already selected
        }else throw Error("You cannot apply (you Got selected)")
    }

    
    static async findAllJobApplied(user){

        //getting the applicat data from database
        const appdata = await applicant.findOne( {_id :new mongoose.Types.ObjectId(user)} );
        let result;

        
            //filter the datails of appliedjob database and storing in the result
            result = await appliedJob.aggregate([
                {
                    $match:{
                        applicantId : new mongoose.Types.ObjectId(user),
                    },  
                },
                //creating a lookup to show refernced total data
                {
                    
                    $lookup: {
                        from: "applicants",
                        localField:"applicantId",
                        foreignField:"_id",
                        as:"applicantId"
                    } 
                },
                {
                    $lookup:{
                        from: "orgs",
                        localField : "orgId",
                        foreignField:"_id",
                        as:"orgId"
                    }
                },
                {
                    $lookup:{
                        from: "jobs",
                        localField : "jobId",
                        foreignField:"_id",
                        as:"jobId"
                    }
                },
                //removing the confidential data
                { "$project": { "orgId.password": 0, "applicantId.password":0 ,"jobId.vacancies":0}}
            ]).exec();
        //returning the result
        return result;
    }



    /**
     * Function to find jobseekers who applied for a job
     * @param user 
     * @returns 
     */
    static async findJobApplied2(user){

        //getting the applicat data from database
        const appdata = await applicant.findOne( {_id :new mongoose.Types.ObjectId(user)} );
        let result;

        //checking is applicant is selected in other organization or not
        if(appdata.Selected==false){

            //filter the datails of appliedjob database and storing in the result
            result = await appliedJob.aggregate([
                {
                    $match:{
                        applicantId : new mongoose.Types.ObjectId(user),
                    },  
                },
                //creating a lookup to show refernced total data
                {
                    
                    $lookup: {
                        from: "applicants",
                        localField:"applicantId",
                        foreignField:"_id",
                        as:"applicantId"
                    } 
                },
                {
                    $lookup:{
                        from: "orgs",
                        localField : "orgId",
                        foreignField:"_id",
                        as:"orgId"
                    }
                },
                {
                    $lookup:{
                        from: "jobs",
                        localField : "jobId",
                        foreignField:"_id",
                        as:"jobId"
                    }
                },
                //removing the confidential data
                { "$project": { "orgId.password": 0 }}
            ]).exec();
        }
        else{

            //getting the applicant details on which organization he got selected
            result = await applicant.aggregate([
                {
                    $match:{
                        _id : new mongoose.Types.ObjectId(user),
                    },  
                },
                {
                    $lookup:{
                        from: "jobs",
                        localField:"jobRef",
                        foreignField:"_id",
                        as:"jobRef"
                    }
                },
            ]).exec();
        }

        //returning the result
        return result;
    }

    /**
     * Finding jobs by domain
     * @param domainId 
     */
    static async findByDomain(domainId:string):Promise<Ijob[]>{

        //geting the jobs data anf filtering 
        const result = await jobs.aggregate([
            //Displaying jobs within specified domain(only jobs with atleast 1 vacancy)
            {
                $match :{$and:[ {domainId:new mongoose.Types.ObjectId(domainId)},{vacancies: {$gt: 0 }}]} ,
            },
            //adding lookup to view referenced objects
            {
                $lookup: {
                    from:"orgs",
                    localField:"orgId",
                    foreignField:"_id",
                    as:"orgDetails"
                }
            },
            {
                $lookup:{
                    from:"domains",
                    localField:"domainId",
                    foreignField:"_id",
                    as:"domainDetails",
                }
            },
            //adding project aggregate to hide confidential dataa
            { "$project": { "orgDetails.password": 0 ,"__v":0 , "orgDetails.__v":0, "domainDetails.__v":0} }
        ]).exec();
        return result;
    }

}


