import jobs,{ Ijob } from "../models/job";
import orgs,{ Iorg } from "../models/organization";
import applicant,{ Iapplicant } from "../models/applicant";
import mongoose from "mongoose";
import appliedJob from "../models/appliedJob";
import job from "../models/job";
import selectedApplicant from "../models/selectedApplicant";

export default class ctrlOrg{
    
    /**
     * Function to authenticate organization
     * @param email 
     * @param password
     */
    static async orgAuth(email:string,password:string){
        const orgDetails = await orgs.findOne({ email }).lean();
            //Checking provided credentials
            if(email){
                if(password === orgDetails.password){
                    return orgDetails;
                }
                //Error messages for incorrect credentials          
                else{
                    throw Error ("Enter Correct Password");
                }
            }else{
                throw Error ("Invalid details");
               }
    }

    /**
     * Function for organization to create a job
     * @param body 
     */
    static async createJob(body):Promise<Ijob>{

        //Store job details in collection
        return await jobs.create(body);
        
    }

    /**
    * Function to find find all jobs by an organization
    * @param orgId 
    * @param data 
    */
    static async findAllJob(orgId,data:any):Promise<Ijob[]>{
        //Using filterby variable dynamically
        const filterBy = data.filterBy;
        const sort = data.sort;

        //creating a sorting aggregation for dynamic input
        var sort1 = { $sort: {} }
        sort1["$sort"][filterBy] = sort

        //Finding jobs having a specific organization Id and sorting it
        const jobOrg = await jobs.aggregate([
            {
                $match: {
                    orgId : new mongoose.Types.ObjectId(orgId)
                },
                
            },sort1,
        ]).exec();
        return jobOrg;
    }

    /**
     * Function to find applicants (applied for a job) in an organization
     * @param orgId 
     */
    static async appliedApplicants(orgId):Promise<Ijob[]>{
        const totalJobs = await appliedJob.aggregate([

            //Finding applicant profiles referencing to a specific orgID 
            {
                $match:{
                    orgId : new mongoose.Types.ObjectId(orgId)
                }
            }
        ])
        return totalJobs;
    }


    /**
    * Function for organization to select an applicant 
    * @param orgId 
    * @param applicantId 
    */
    static async selectApplicant(orgId,applicantId,jobId){

        //getting the applicant details using applicant id
        const appDetails = await applicant.findOne( {_id : applicantId} )
        
        //getting job details which applicant has applied
        const jobDetails = await job.findOne( { _id : jobId } )
        
        //Decreasing vacancy count by 1 after selection
        const vacancy = jobDetails.vacancies-1;
        
        //checking the selected the status
        if(appDetails.Selected == false){
            //Changing the "selected status" in the applicant profile after selection and updating vacancy 
            if(appDetails._id == applicantId){
                const selectedApp = await applicant.updateOne({_id : applicantId}, {$set: {Selected:true}},{new:true});
                const jobdet = await job.updateOne({_id: jobId}, {$set : {vacancies: vacancy}},{new:true});
                const jobdet2 = await applicant.updateOne({_id: applicantId}, {$set : {jobRef:jobId}},{new:true});
                //creating the data object which is same as selectedApplicant scehma and pushing into database
                const data = {
                    applicantId:applicantId,
                    orgId:orgId,
                    jobRef:jobId
                }
                await selectedApplicant.create(data);
                return selectedApp;
            }
        }else{
            //Error message if applicant is already selected
            throw Error ("Got selected in other Organization")
        }
    }


    /**
    * Function for an organization to delete applications 
    * @param orgId 
    */
    static async deleteApplication(orgId){

        //removign the data from database
        await appliedJob.remove({orgId : orgId});
    }
}