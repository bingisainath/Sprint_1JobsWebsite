import express from "express";
import expressResponse from "../middleware/expressResponse";
import bodyParser from "body-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import Joi,{date} from "joi";
import ctrlAdmin from "../controllers/admin";
import ctrlOrg from "../controllers/organization";
import moment from "moment";
import ctrlApplicant from "../controllers/applicant";

//creating the  class server exporting
export default class server{
    //initializing teh express with app const
    app = express();

    //starting the express-server,mongo,middleware,routes & defRoutes
    async start(){
        try{
            
            console.log("Listening the Server");

            //listening the port
            this.app.listen(process.env.PORT);
            console.log("Successfully connected to "+process.env.PORT)

            //calling the middleware method where all middleware are present
            this.middleware();

            //calling the routes methods where all HTTP request are present
            this.routes();

            //calling the defroutes fro server testing
            this.defRoutes();
        }catch(e){

            //catching and printing the error in console if something happens 
            console.log("Error"+e);
        }
    }

    //middleware for requests
    middleware(){

        //bpdy-parser middleware for parsing the body data providing in postman
        this.app.use(bodyParser.urlencoded({extended : false}))

        //session middleware 
        this.app.use(
            session({

                //providing the secret to store in cookie
                secret: process.env.SESSION_SECRET,
                resave: false,
                saveUninitialized: false,

                //storing the session in mongodb URL
                store: MongoStore.create({
                    mongoUrl: process.env.SESSION_URL,
                }),

                //fixing age of cookie to 24hours
                cookie: {
                    maxAge : 24 * 60 * 60 * 1000,
                },
            }
        ))
    }

    //defining the all required Routes
    routes(){

        //Authenticating the Admin
        this.app.post("/admin/auth",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{
                //creating a schema for input validation
                const schema = Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().required()
                })

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.body);

                //calling the adminAuth function for authentication
                const admin = await ctrlAdmin.adminAuth(data.email,data.password);

                //storing the admin session details in cookies
                req.session.admin=admin;

                //sending a success response with status code 200 in postman 
                resp.status(200).send(admin);

            }),
        );

        //creating a organization by Admin
        this.app.post("/admin/createOrg",

         //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{
            
                //checking the admin is authenticated or not by cookie saved in database
                if(req.session && req.session.admin){

                        //creating a schema for input validation
                        const schema = Joi.object({
                            orgName: Joi.string().required(),
                            email:Joi.string().email().required(),
                            password: Joi.string().required()
                        })

                        //validating the Joi schema provided
                        const data = await schema.validateAsync(req.body)

                        //calling the createOrg function for creating organization by admin
                        const result = await ctrlAdmin.createOrg(data.orgName,data.email,data.password);

                        //creating a output object consists of success and email
                        const output = {
                            success:true,
                            email:result.email
                        }

                        //sending a success response with status code 200 in postman 
                        resp.status(200).send(output);
                    }
                else{
                    //sending a failed response with status code 500 in postman
                    resp.status(500).send("Admin Not Authenticated")
                }
                }
            ),
        )


        //creating a Domain by Admin
        this.app.post("/admin/createDomain",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{    

                //checking the admin is authenticated or not by cookie saved in database
                if(req.session && req.session.admin){
                    
                        //creating a schema for input validation
                        const schema = Joi.object({
                            domainName: Joi.string().required()
                        })
                        
                        //validating the Joi schema provided
                        const data = await schema.validateAsync(req.body)

                        //calling the createDomain present in controllers(admin) for creating the data in database
                        const result = await ctrlAdmin.createDomain(data);

                        //storing the email and success in object 
                        const output = {
                            success:true,
                            email:result.domainName
                        }

                        //sending a success response with status code 200 in postman 
                        resp.status(200).send(output);
                    }
                else{

                     //sending a failed response with status code 500 in postman
                    resp.status(500).send("Admn Not Authenticated")
                }
            })
        )


        //gettting all organizations created by Admin
        this.app.get("/admin/allOrg",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

                //checking the admin is authenticated or not by cookie saved in database
                if(req.session && req.session.admin){

                     //calling the findAllOrg present in controllers(admin) for finding the data in database
                    const data = await ctrlAdmin.findAllOrg();

                    //sending a success response with status code 200 in postman 
                    resp.status(200).send(data);
                }else{

                     //sending a failed response with status code 500 in postman
                    resp.status(500).send("Admn Not Authenticated")
                }
            })
        )

        //gettting all domians created by Admin
        this.app.get("/admin/allDomain",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

                //checking the admin is authenticated or not by cookie saved in database
                if(req.session && req.session.admin){

                    //calling the findAllDomain present in controllers(admin) for finding the data in database
                    const data = await ctrlAdmin.findAllDomain();

                    //sending a success response with status code 200 in postman 
                    resp.status(200).send(data);
                }else{

                     //sending a failed response with status code 500 in postman
                    resp.status(500).send("Admn Not Authenticated")
                }
            
            })
        )


        //logout of admin
        this.app.post("/admin/logout",async(req,resp)=>{

            //destroying the session stored in cookie for admin (logging out)
            req.session.destroy(() => {});

            //sending a success response with status code 200 in postman 
            resp.status(200).send("Admin is logged out")
        })

        //Organization authentication
        this.app.post("/org/auth",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //creating a schema for input validation
            const schema = Joi.object({
                email:Joi.string().email().required(),
                password:Joi.string().required(),
            })

            //validating the Joi schema provided
            const data = await schema.validateAsync(req.body);

            //calling the orgAuth present in controllers(organization) for authentication
            const org = await ctrlOrg.orgAuth(data.email,data.password);

            //creating a session cookie for organization
            req.session.org=org;

            //sending a success response with status code 200 in postman 
            resp.status(200).send({success:true,email:org.email});
        })
        )

        //creating a job by Organization
        this.app.post("/org/createJob",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //checking the org is authenticated or not by cookie saved in database
            if(req.session && req.session.org){

                //getting the present time and date by moment object
                const date = moment().format("YYYY-MM-DD HH:MM");

                //creating a schema for input validation
                const schema = Joi.object({
                    jobName:Joi.string().required(),
                    CTC:Joi.number().required(),
                    vacancies: Joi.number().required(),
                    domainId : Joi.string().required(),
                    postedTime: Joi.date().default(date),
                })

                //validating the Joi schema provided
                const data =await schema.validateAsync(req.body);
                const orgId = req.session.org._id;
                const data1= {
                    ...data,
                    orgId:orgId
                }
                //calling the createJob present in controllers(organization) for creating the data in database
                const result = await ctrlOrg.createJob(data1);

                //sending a success response with status code 200 in postman 
                resp.status(200).send(result);
            }else{

                 //sending a failed response with status code 500 in postman
                resp.status(500).send("Org Not Authenticated");
            }
        })
        )

        //posting the Job by Organization
        this.app.get("/org/jobPostedByOrg",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //checking the org is authenticated or not by cookie saved in database
            if(req.session && req.session.org){

                //creating a schema for input validation
                const schema = Joi.object({
                    filterBy:Joi.string().default("postedTime"),
                    sort: Joi.number().default(1)
                })

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.body);

                //calling the findAllJob present in controllers(organization) for finding the data in database
                const result = await ctrlOrg.findAllJob(req.session.org._id,data);

                //sending a success response with status code 200 in postman 
                resp.status(200).send(result);
            }else{

                 //sending a failed response with status code 500 in postman
                resp.status(500).send("Org Not Authenticated");
            }
        })
        )


        //getting all Applicants details
        this.app.get("/org/jobAppliedApplicants",

        //using expressresponse middleware for error handling
        expressResponse(async (req,resp)=>{

            //checking the org is authenticated or not by cookie saved in database
            if(req.session && req.session.org){

                //calling the appliedApplicants present in controllers(organization) for finding the data in database
                const result = await ctrlOrg.appliedApplicants(req.session.org._id);

                //sending a success response with status code 200 in postman 
                resp.status(200).send(result);
            }else{

                 //sending a failed response with status code 500 in postman
                resp.status(500).send("Org Not Authenticated");
            }
        })
        )

        //selecting the applicants
        this.app.post("/org/selectApplicant",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //checking the org is authenticated or not by cookie saved in database
            if(req.session && req.session.org){

                //creating a schema for input validation
                const schema = Joi.object({
                    jobId:Joi.string().required(),
                    applicantId:Joi.string().required()
                })

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.body);

                //calling the selectApplicant present in controllers(organization) for selecting and storing the data in database
                const result = await ctrlOrg.selectApplicant(req.session.org._id,data.applicantId,data.jobId);

                //sending a success response with status code 200 in postman 
                resp.status(200).send(result);
            }else{

                 //sending a failed response with status code 500 in postman
                resp.status(500).send("Org Not Authenticated");
            }
        })
        )

        //getting the details of selected applicants
        this.app.get("/org/selectedApplicants",

        expressResponse(async (req,resp)=>{
            
            if(req.session && req.session.org){

                const result = await ctrlOrg.selectedApp(req.session.org._id);
                return result;

            }else{
                //sending a failed response with status code 500 in postman
                resp.status(500).send("Org Not Authenticated")
            }

        })
        )

        //deleting the unSelected applicants
        this.app.delete("/org/deleteApplicants",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //checking the org is authenticated or not by cookie saved in database
            if(req.session && req.session.org){

                //calling the deleteApplication present in controllers(organization) for deleting the data in database
                const result = await ctrlOrg.deleteApplication(req.session.org._id);

                //sending a success response with status code 200 in postman 
                resp.status(200).send("All Applicants are deleted")
            }else{

                //sending a failed response with status code 500 in postman
                resp.status(500).send("Org Not Authenticated")
            }
        })    
        )

        

        //organization logout
        this.app.post("/org/logout",async(req,resp)=>{

            //destroying the session stored in cookie for organization (logging out)
            req.session.destroy(() => {});

            //sending a success response with status code 200 in postman 
            resp.status(200).send("Organization is logged out")
        })

        //creating the applicant(user) account
        this.app.post("/user/create",

            //using expressresponse middleware for error handling
            expressResponse(async(req,resp)=>{

                //creating a schema for input validation
                const schema = Joi.object({
                    name:Joi.string().required(),
                    email: Joi.string().email().required(),
                    password : Joi.string().required()
                })

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.body);

                //calling the createAcc present in controllers(organization) for creating the data in database
                const result = await ctrlApplicant.createAcc(data);

                //sending a success response with status code 200 in postman 
                resp.status(200).send({success:true,
                    email:result.email})
            })
        )

        //authentication of applicant(user)
        this.app.post("/user/auth",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //creating the Joi schema for input validation 
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required()
            })

            //validating the Joi object with body
            const data = await schema.validateAsync(req.body);

            //calling the appAuth method for authenticating
            const applicant = await ctrlApplicant.appAuth(data);

            //assing session to applicant
            req.session.applicant=applicant;

            //sending a success response with status code 200 in postman 
            resp.status(200).send({success:true,
                email:applicant.email});
        })
        )


        this.app.get("/user/profile",
        expressResponse(async(req,resp)=>{
            if(req.session && req.session.applicant){

                const result = await ctrlApplicant.profile(req.session.applicant._id);
                return result;

            }else{
                //sending a failed response with status code 500 in postman
                resp.status(500).send("User Not Authenticated")
            }
        })
        )

        //finding all domians
        this.app.get("/findDomain",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

                //creating a schema for input validation
                const schema = Joi.object({
                    limit: Joi.number().integer().default(5),
                    page: Joi.number().integer().default(0),
                    sort: Joi.number().integer().default(1)
                })

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.body);

                //calling the findDomain present in controllers(applicant) for finding the data in database
                const result = await ctrlApplicant.findDomain(data.limit,data.page,data.sort);

                //sending a success response with status code 200 in postman 
                resp.status(200).send(result);
        })
        )


        //getting the job which are related to specific domain By domain id
        this.app.get("/user/findByDomain",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //checking the applicant is authenticated or not by cookie saved in database
            if(req.session && req.session.applicant){

                //creating a schema for input validation
                const schema = Joi.object({
                    domainId: Joi.string().required()
                })

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.body);

                //calling the findByDomain present in controllers(applicant) for finding the data in database
                const result = await ctrlApplicant.findByDomain(data.domainId);

                //sending a success response with status code 200 in postman 
                resp.status(200).send(result);
            }else{

                 //sending a failed response with status code 500 in postman
                resp.status(500).send("User Not Authenticated")
            }
        })
        )

        //finding allJobs present in database
        this.app.get("/user/findAllJob",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //checking the applicant is authenticated or not by cookie saved in database
            if(req.session && req.session.applicant){

                //creating a schema for input validation
                const schema = Joi.object({
                    limit: Joi.number().integer().default(5),
                    page: Joi.number().integer().default(0),
                    filterBy: Joi.string().default("postedTime"),
                    sort: Joi.number().integer().default(1)
                })

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.query)

                //calling the findAllJob present in controllers(applicant) for finding the data in database
                const result = await ctrlApplicant.findAllJob(data.limit,data.page,data.filterBy,data.sort);

                //sending a success response with status code 200 in postman 
                resp.status(200).send(result); 
            }else{

                 //sending a failed response with status code 500 in postman
                resp.status(500).send("User Not Athenticated")
            }
        })
        )

        //applying the job
        this.app.post("/user/applyJob",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //checking the applicant is authenticated or not by cookie saved in database
            if(req.session && req.session.applicant){

                //creating a schema for input validation
                const schema = Joi.object({
                   // orgId: Joi.string().required(),
                    jobId: Joi.string().required(),
                })

                //validating the Joi schema provided
                const data = await schema.validateAsync(req.body)

                //calling the applyJob present in controllers(applicant) for applying the data in database
                const result = await ctrlApplicant.applyJob(data,req.session.applicant._id);

                //sending a success response with status code 200 in postman 
                resp.status(200).send(result);
            }else{

                 //sending a failed response with status code 500 in postman
                resp.status(500).send("User Not Authenticated")
            }
        })
        )

        //jobs applied by the user
        this.app.get("/user/jobsApplied",

        //using expressresponse middleware for error handling
        expressResponse(async(req,resp)=>{

            //checking the applicant is authenticated or not by cookie saved in database
            if(req.session && req.session.applicant){

                //calling the findJobApplied present in controllers(applicant) for finding the data in database
                const result = await ctrlApplicant.findJobApplied2(req.session.applicant._id);

                //sending a success response with status code 200 in postman 
                resp.status(200).send(result); 
            }else{

                 //sending a failed response with status code 500 in postman
                resp.status(500).send("User Not Authenticated")
            }
        })
        )

        //user logout
        this.app.post("/user/logout",async(req,resp)=>{

            //destroying the session stored in cookie for user (logging out)
            req.session.destroy(() => {});

            //sending a success response with status code 200 in postman 
            resp.status(200).send("User is logged out")
        })


    }

    


    //default routes for testing
    defRoutes(){
        // check if server running
        this.app.all("/", (req, resp) => {
            resp.status(200).send({ success: true, message: "Server is working" });
        });

        this.app.all("*", (req, resp) => {
            resp.status(404).send({ success: false, message: `given route [${req.method}] ${req.path} not found` });
        });
    }
}