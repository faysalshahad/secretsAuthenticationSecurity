
// console.log ("Testing the app.js file");
/**Requiring dtenv modules after installing it by using npm i dotenv. The code can be found
 * https://www.npmjs.com/package/dotenv
 * this is a must follow important rule to declare and require dotenv modules as early as possible
 * inside our programme.
 */
require('dotenv').config();

/*Creating a new node app. To do that we are requiring an express module. */
const express = require ("express");

/**requiring mongoose module */
const mongoose = require ("mongoose");

/*Creating a new node app. To do that we are requiring an express module. */
const https = require ("https");

/**To catch the data from user input we need to install bodyparser module */
const bodyparser = require ("body-parser");

/**requiring ejs module */
const ejs = require ("ejs");

/**requiring express-session modules */
const session = require("express-session");

/**requiring passport modules */
const passport = require ("passport");

/**requiring passport local */
//const LocalStrategy = require ("passport-local").Strategy;

/**requiring passport local mongoose module */
const passportLocalMongoose = require ("passport-local-mongoose");

/**requiring connect mongoDB session module */
const mongodbSession = require ("connect-mongodb-session")(session);

/**Requiring md5 files */
//const md5 = require ("md5");

/**Requiring bcrypt files */
const bcrypt = require ("bcrypt");

/**Defining how many salt rounds are required to encrypt our password.
 * mandatory declaration to use bcrypt functionalities.
 * the more salt round you will use the more processing power your computer will take.
 * it will slow the performance down.
 * 2 ghz computer takes around
 * rounds=8 : ~40 hashes/sec
rounds=9 : ~20 hashes/sec
rounds=10: ~10 hashes/sec
rounds=11: ~5  hashes/sec
rounds=12: 2-3 hashes/sec
rounds=13: ~1 sec/hash
rounds=14: ~1.5 sec/hash
rounds=15: ~3 sec/hash
rounds=25: ~1 hour/hash
rounds=31: 2-3 days/hash
to calculte the hash.
it's best to use less round to not to stress out the computer
 but to have more security please use more rounds.
 */
//const saltRounds = 4;

/**requiring mongoose encryption module */
//const mongooseencryption = require("mongoose-encryption");

/**this is for just a test purpose to see how dotenv environmental variable works.
 * here API_KEY variable is being collected from the .env file. 
 * must declare the process.env.(variable name) to access the environmental variable 
 * from the .env file in node.js
 */
console.log(process.env.API_KEY);

const { log, Console, error } = require("console");

/* The variable name app is being used because it is the best practice 
to use app as a name to represent express modules or express app.*/
const app = express();

/*This code will help our server to serve static files such as CSS and Images, we need
to use a special function of Express module. That is known as static. Here the public 
is the folder name where our static files like CSS and images will reside.*/
app.use(express.static("public"));

/**This is a must necessary code to declare to use the body-parser module to capture user input. */
app.use(bodyparser.urlencoded({extended: true}));

/**Must requirement code to set up ejs. The code is found from 
 https://github.com/mde/ejs/wiki/Using-EJS-with-Express */
 app.set ("view engine", "ejs");

 
/**To create database inside local mongodb database */
//const URImongoDB = "mongodb://127.0.0.1:27017/usernameDB";

/**To create database inside mongodb atlas cloud server database */
const URImongoDB = "mongodb+srv://faysalshahad:<Provide Your Password Here>@faysalshahad.nbqqn3d.mongodb.net/usernameDB";


 //connection URL to mongoose database locally where todolistDB is the database name
 mongoose.connect(URImongoDB, {useNewUrlParser:true, useUnifiedTopology:true}).then(()=>{
    console.log("MongoDB is connected");
});

const storemongodbSession = new mongodbSession ({
    uri: URImongoDB,
    collection: "mySession",

});

/** Initialising the session module 
  * plese visit the following page to get more details regarding how to use session
  * https://www.npmjs.com/package/express-session
  */
app.use(session({
    secret: "Session Module has already been aquired in our application above. This is a secret String",
    resave: false,
    saveUninitialized: false,
    store: storemongodbSession
}));

const isAuth = function (req, res, next ) {
    if (req.session.isAuth) {
        next()
        
    } else{
        res.redirect("/login");
    }


};


/**Initialising passport module right below the session module and it is a rule. This initialize method 
 * comes as a bundle with passport and set up passport module for us to start using for authentication.
*/
app.use(passport.initialize());

/**In this line we are telling our app to use passport and also set up session */
app.use(passport.session());

 
// connection URL to mongoose database locally where todolistDB is the database name
//mongoose.connect("mongodb://127.0.0.1:27017/usernameDB", {useNewUrlParser:true, useUnifiedTopology:true});

/** Creating a new schema for our database */
const usercredentialschema = new mongoose.Schema ({

    userEmail : 
    { 
        //creating javascript object
        type: String,
        //making this taskName field mandatory for the user by using required validator
        required: [true, "Please check the input entry as no task name has been entered"],
        /** `useremail` must be unique */
        unique: [true, "Please provide another email because this email is already been registered. "] 
    },

    userPassword:
    { 
        //creating javascript object
        type: String,
        //making this taskName field mandatory for the user by using required validator
        required: [true, "Please check the input entry as no task name has been entered"]
    },

    userSecretMessage: String

});

/**setting up passport-local-mongoose module. This will be used to Hash and Salt our passwords 
 * and save the hashed salted passwords inside the mongodb database or in this case usernameDB*/
usercredentialschema.plugin(passportLocalMongoose);



/** Defining a encryption plugin before creating mongoose collection. This is very important 
 * and must follow law. This is the mongoose encryption method to encrypt the passwod section.
 * This is known as level 2 security 
 * here TEST_SECRET variable is being collected from .env file
 * 
 * must declare the process.env.(variable name) to access the environmental variable from the .env file 
 * in node.js*/
//usercredentialschema.plugin(mongooseencryption, {secret: process.env.TEST_SECRET, encryptedFields: ["userPassword"]});

/**Creating a Collection called User for our databse usernamDB */
const User = mongoose.model("User", usercredentialschema);

/**The following three lines of codes are must used codes which have been collected from the website
 * https://www.npmjs.com/package/passport-local-mongoose
 * These codes must be used right after when ww have declared the mongoose schema and mongood collection model.
 */
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

/**Serializing and desiralizing the user details */
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

 let finalAuthorisedUserID, finalAuthorisedUserEmail;

 

app.get("/", (req, res)=>{
   // req.session.isAuthenticated = true;
res.render("home");
//console.log("Checking the session and cookies " + req.session.isAuthenticated + " and " +req.session.id);
});

app.get("/login", (req, res)=>{
    res.render("login");
    }); 

     app.get("/register", (req, res)=>{  
        res.render("register");
        });

        app.get("/secrets", isAuth, (req, res)=>{ 
            // if (req.isAuthenticated()) {

            //     console.log("User is logged in");
            //     res.render("secrets");
                
            // } else {
            //     console.log("User is not logged in");
            //     res.render("/login");
            // }
             console.log("Checking the session and cookies in Secret Page " + req.session.isAuth + " and " +req.session.id);
                    
             User.find({userSecretMessage: {$ne: null}}).then((usersWithMessage)=>{

                console.log("Display Submitted Secret Message " +usersWithMessage);

                //res.render("secrets2");

                // res.render("secrets2",
                  // {d1: usersWithMessage});

             }).catch(function (error){ // trying to catch error
                 console.log("There is an error while fetching secret messages from all the document " + error);
                
             });

            res.render("secrets");
            });

            app.get("/logout", (req, res)=>{
                req.logout(function(err) {
                    if (err) { 
                      console.log("There is an error while logging out " + err);
                      return next(err); }
                    res.render("home");
                  });
            });

            app.get("/submit", isAuth, (req, res)=>{
                console.log("Checking the session and cookies in Submit Page " + req.session.isAuth + " and " +req.session.id);
                    
                
                res.render("submit");

            });


            app.get("/secrets2", isAuth, (req, res)=>{ 
                
                 console.log("Secret 2 page Checking the session and cookies in Secret Page " + req.session.isAuth + " and " +req.session.id);
                        
                 User.find({userSecretMessage: {$ne: null}}).then((usersWithMessage)=>{
    
                    console.log("Secret 2 Display Submitted Secret Message " +usersWithMessage);
    
                    //res.render("secrets2");
    
                    res.render("secrets2",
                     {d1: usersWithMessage});
    
                 }).catch(function (error){ // trying to catch error
                     console.log("There is an error while fetching secret messages from all the document " + error);
                    
                 });
    
                //res.render("secrets");
                });

            /**=============Starting app.post ("/Log Out")================================ */

            app.post('/logout', function(req, res){
                req.session.destroy(function (error){
                    if (err) {
                        console.log("There is an error while logging out " + err);
                        
                    }
                    res.redirect("/");
                });
                
              });

              app.post("/submit", isAuth, (req, res)=>{

                const getSecretMessageSubmitPage = req.body.submitSecretMessage;

                //console.log("Current User " + req.user);
                console.log("Authorized user ID in submit page " + finalAuthorisedUserID + " and email is " + finalAuthorisedUserEmail);
                //res.render("submit");

                User.findById(finalAuthorisedUserID).then(function (userSecret) {

                    userSecret.userSecretMessage = getSecretMessageSubmitPage;

                    userSecret.save().then(()=>{

                        res.redirect("/secrets2");

                    }).catch(function (error){ // trying to catch error
                        console.log("There is an error while saving secret inside the document " + error);
                        
                    
                }).catch(function (error){ // trying to catch error
                    console.log("There is an error while submitting the new secret " + error);
                    


            });

        });

    });


                 /**=============Closing app.post ("/Log Out")================================ */

         /**============= Starting app.post ("/register") ========================*/ 
         app.post("/register", async (req, res)=>{ //Starting app.post ("/register") 

            const inputEmailRegister = req.body.userEmailRegister;
            const inputPasswordRegister = req.body.userPasswordRegister;
            console.log("User email " + inputEmailRegister + " and user password " + inputPasswordRegister);

            const checkUserRegisterPage = await User.findOne({userEmail: inputEmailRegister});

            if (checkUserRegisterPage) {
                
                console.log("User email already been registered before. Please give a new email address " + checkUserRegisterPage);

               return res.redirect("/register");
            } 

            const bcryptedPassword = await bcrypt.hash(inputPasswordRegister, 4);

            const newUserDocument = new User ({
                 userEmail: inputEmailRegister,
                 userPassword: bcryptedPassword
            });

           await newUserDocument.save().then(()=>{
                    console.log("Successfully Added New user named " + inputEmailRegister+ 
                                " and password " +bcryptedPassword);
                                console.log();
                        res.render("login");
            }).catch(function (error){ // trying to catch error
                             console.log("There is an error while registering the new user " + error);
                                res.send("There is an error while registering the new user " + error);
                    
                 });



            

// User.register(new User({username: req.body.userEmailRegister }), req.body.userPasswordRegister, async function (error, newUserRegistering){


  

//         if (error){ // trying to catch error
//             console.log("There is an error while registering the new user " + error);
//             // res.send("There is an error while registering the new user " + error);
//              res.redirect("/register");
//         } else{
//             //const authenticate1 = ;
//             passport.authenticate("local") (req, res, function() {
                
//                 console.log("Registration is sucessful");
//                res.redirect("/secrets");
//             });

//         }
//     })


// .then((registeredUser)=>{

    
// }).catch(function (error){ // trying to catch error
//                        console.log("There is an error while registering the new user " + error);
//                    // res.send("There is an error while registering the new user " + error);
//                     res.redirect("/register");
       
//                 });



                }); // closing app.post ("/register") 


           /**============= Closing app.post ("/register") ========================*/ 



             /**============= Starting app.post ("/login") ========================*/ 

        app.post("/login", async function (req, res) { // Starting app.post ("/login")

             const inputLoginEmail = req.body.userEmailLogin;
             const inputLoginPassword = req.body.userPasswordLogin;

             console.log("Login email " + inputLoginEmail + " and Login password " + inputLoginPassword);
            
            const checkUserLoginPage = await User.findOne({userEmail: inputLoginEmail});

            // finalAuthorisedUserID = checkUserLoginPage._id;

            // finalAuthorisedUserEmail = checkUserLoginPage.userEmail;

            console.log("User id in Login Page " + finalAuthorisedUserID + " and user email " +finalAuthorisedUserEmail);

            if (!checkUserLoginPage){

                console.log("The email is not valid. Please register first " + checkUserLoginPage);
                return res.redirect("/login");

            }

            const checkPasswordLoginPage = await bcrypt.compare(inputLoginPassword, checkUserLoginPage.userPassword);

            if (!checkPasswordLoginPage) {

                console.log("The password is not valid. Please use correct password and login credentials " + checkUserLoginPage);
                return res.redirect("/login");

            } else{


                finalAuthorisedUserID = checkUserLoginPage._id;

             finalAuthorisedUserEmail = checkUserLoginPage.userEmail;
                
                req.session.isAuth = true;
                    console.log("Login is Successful Page");
                    console.log("Authorized user " + checkUserLoginPage);
                    console.log("Checking the session and cookies in Login Page " + req.session.isAuth + " and " +req.session.id);
                    
                    return res.render("secrets");

                }
            



            // const userLoginPage = new User ({

                

            // });

            // req.logIn(userLoginPage, function (error) {
            //     if (error) {
            //         console.log("There is a error while login in " + error);
            //         res.redirect("/login");
                    
            //     } else{
            //         passport.authenticate("local", req, res, function (){
            //             console.log("Login is Successful from Login Page");
            //             res.redirect("/secrets");

            //         })
            //     }
            // })


        }); // Closing app.post ("/login")

         /**============= Closing app.post ("/login") ========================*/ 



//             /**============= Starting app.post ("/register") ========================*/ 
//         app.post("/register", (req, res)=>{ //Starting app.post ("/register") 

//             /** Code has been collected from the page 
//              * https://www.npmjs.com/package/bcrypt
//              * using bcrypt module with hash fucntion to secure the password
//              */

//             bcrypt.hash(req.body.userPasswordRegister, saltRounds).then(function(hash) {
//                 console.log("The original password was " +req.body.userPasswordRegister+ 
//                 ". Successfully hashed the password by using bcrypt module = " +hash);
//                 //res.render("secrets");
// /**Creating a new document inside users collection in usernameDB database */
//                 const newUserDocument = new User ({
//                     userEmail: req.body.userEmailRegister,
//                     /**Turning this password contents into an irreversible hash by using md5 module which is 
//                      * being created by requiring md5 module.*/
//                     //userPassword: md5(req.body.userPasswordRegister)
//                     /**Using bcrypt module store the secured salted hash password inside userPassword variable 
//                      * */
//                     userPassword: hash
//                 });
//     /**saving the new usr document in User collection inside the usernameDB database */
//                 newUserDocument.save().then(()=>{
//                     console.log("Successfully Added New user named " + req.body.userEmailRegister+ 
//                     " and password " +hash);
//                     res.render("secrets");
    
//                 }).catch(function (error){ // trying to catch error
//                     console.log("There is an error while registering the new user " + error);
//                     res.send("There is an error while registering the new user " + error);
    
//                 });
    

//             }).catch(function (error){ // trying to catch error
//                 console.log("There is an error while hashing the password using bcrypt " + error);
//                 res.send("There is an error while hashing the password using bcrypt " + error);

//             });
            
//         }); // closing app.post ("/register") 

//            /**============= Closing app.post ("/register") ========================*/ 


//              /**============= Starting app.post ("/login") ========================*/ 

//         app.post("/login", function (req, res) { // Starting app.post ("/login")
           
//             /**Capturing user details from login page and storing them inside this variable */
//             const inputEmailLogin = req.body.userEmailLogin;
//             const inputPasswordLogin = req.body.userPasswordLogin;

//             /**Storing encrypted Password by using md5 module inside this variable */
//             //const inputPasswordLogin = md5(req.body.userPasswordLogin);

//             /**using findOne method to fetch one specific document from inside the User collection */
//             User.findOne({userEmail: inputEmailLogin}).then(function(registeredUser){

// /** checking whther the user actually exisits in the database or not */
//                 if (registeredUser) {

//                      /** Code has been collected from the page 
//              * https://www.npmjs.com/package/bcrypt
//              * using bcrypt module with hash fucntion to secure the password
//              */
//                      bcrypt.compare(inputPasswordLogin, registeredUser.userPassword).then(function(result) {
//                        if (result === true){
//                         console.log("User Email " + inputEmailLogin +
//                         " and Passowrd " + registeredUser.userPassword +" is correct.");
//                         res.render("secrets");
//                         // result == true

//                        }

//                        else{
//                         console.log("Password is wrong " + inputPasswordLogin);
//                         res.send("Password is wrong " + inputPasswordLogin);
//                        }
                     
//                     // }).catch(function (error){ // trying to catch error
//                     //     console.log("Password is wrong " + inputPasswordLogin);
//                     //     res.send("Password is wrong " + inputPasswordLogin);
        
//                     });

//                     /** checking whether the password matches with the database or not */
//                 //     if (registeredUser.userPassword === inputPasswordLogin) {
//                 //         console.log("User Email " + inputEmailLogin +
//                 //         " and Passowrd " + inputPasswordLogin +" is correct.");
//                 //         res.render("secrets");
//                 //     }
//                 //     else{
//                 //         console.log("Password is wrong " + inputPasswordLogin);
//                 // res.send("Password is wrong " + inputPasswordLogin);

//                 //     }
                    
//                 }
//                 else{
//                     console.log("Wrong Email address " + inputEmailLogin);
//                     res.send("Wrong Email address " + inputEmailLogin);
//                 }

//             }).catch(function (error){ // trying to catch error
//                 console.log("There is an error while login " + error);
//                 res.send("There is an error while login " + error);

//             });

//         }); // Closing app.post ("/login")

         /**============= Closing app.post ("/login") ========================*/ 



//    /**============= Starting app.get ("/register") ========================*/ 

//     app.get("/register", (req, res)=>{  //Starting app.get ("/register") 
//         res.render("register");
//         });

//         app.post("/register", (req, res)=>{

//             /** Code has been collected from the page 
//              * https://www.npmjs.com/package/bcrypt
//              * using bcrypt module with hash fucntion to secure the password
//              */

//             bcrypt.hash(req.body.userPasswordRegister, saltRounds).then(function(hash) {
//                 console.log("The original password was " +req.body.userPasswordRegister+ 
//                 ". Successfully hashed the password by using bcrypt module = " +hash);
//                 //res.render("secrets");
// /**Creating a new document inside users collection in usernameDB database */
//                 const newUserDocument = new User ({
//                     userEmail: req.body.userEmailRegister,
//                     /**Turning this password contents into an irreversible hash by using md5 module which is 
//                      * being created by requiring md5 module.*/
//                     //userPassword: md5(req.body.userPasswordRegister)
//                     /**Using bcrypt module store the secured salted hash password inside userPassword variable 
//                      * */
//                     userPassword: hash
//                 });
//     /**saving the new usr document in User collection inside the usernameDB database */
//                 newUserDocument.save().then(()=>{
//                     console.log("Successfully Added New user named " + req.body.userEmailRegister+ 
//                     " and password " +hash);
//                     res.render("secrets");
    
//                 }).catch(function (error){ // trying to catch error
//                     console.log("There is an error while registering the new user " + error);
//                     res.send("There is an error while registering the new user " + error);
    
//                 });
    

//             }).catch(function (error){ // trying to catch error
//                 console.log("There is an error while hashing the password using bcrypt " + error);
//                 res.send("There is an error while hashing the password using bcrypt " + error);

//             });
            
//         }); // closing app.get ("/register") 

//            /**============= Closing app.get ("/register") ========================*/ 


//              /**============= Starting app.post ("/login") ========================*/ 

//         app.post("/login", function (req, res) { // Starting app.post ("/login")
           
//             /**Capturing user details from login page and storing them inside this variable */
//             const inputEmailLogin = req.body.userEmailLogin;
//             const inputPasswordLogin = req.body.userPasswordLogin;

//             /**Storing encrypted Password by using md5 module inside this variable */
//             //const inputPasswordLogin = md5(req.body.userPasswordLogin);

//             /**using findOne method to fetch one specific document from inside the User collection */
//             User.findOne({userEmail: inputEmailLogin}).then(function(registeredUser){

// /** checking whther the user actually exisits in the database or not */
//                 if (registeredUser) {

//                      /** Code has been collected from the page 
//              * https://www.npmjs.com/package/bcrypt
//              * using bcrypt module with hash fucntion to secure the password
//              */
//                      bcrypt.compare(inputPasswordLogin, registeredUser.userPassword).then(function(result) {
//                        if (result === true){
//                         console.log("User Email " + inputEmailLogin +
//                         " and Passowrd " + registeredUser.userPassword +" is correct.");
//                         res.render("secrets");
//                         // result == true

//                        }

//                        else{
//                         console.log("Password is wrong " + inputPasswordLogin);
//                         res.send("Password is wrong " + inputPasswordLogin);
//                        }
                     
//                     // }).catch(function (error){ // trying to catch error
//                     //     console.log("Password is wrong " + inputPasswordLogin);
//                     //     res.send("Password is wrong " + inputPasswordLogin);
        
//                     });

//                     /** checking whether the password matches with the database or not */
//                 //     if (registeredUser.userPassword === inputPasswordLogin) {
//                 //         console.log("User Email " + inputEmailLogin +
//                 //         " and Passowrd " + inputPasswordLogin +" is correct.");
//                 //         res.render("secrets");
//                 //     }
//                 //     else{
//                 //         console.log("Password is wrong " + inputPasswordLogin);
//                 // res.send("Password is wrong " + inputPasswordLogin);

//                 //     }
                    
//                 }
//                 else{
//                     console.log("Wrong Email address " + inputEmailLogin);
//                     res.send("Wrong Email address " + inputEmailLogin);
//                 }

//             }).catch(function (error){ // trying to catch error
//                 console.log("There is an error while login " + error);
//                 res.send("There is an error while login " + error);

//             });

//         }); // Closing app.post ("/login")

//          /**============= Closing app.post ("/login") ========================*/ 


/*After this code we have literally just built our very first own server
this is the barebone of any express server.the callback function will give 
us feedback to verify whether the server is running or not. 
also process.env.port has been written when we upload our files to an external server like heroku
then this code will help our file to identify and use the available any random port 
on that particular external server company like heroku.*/


let port = process.env.PORT;

 if (port == null || port == "") {

    port = 3000;
 }

 app.listen (port, ()=>{

    console.log("Server started on port 3000 locally or getting a dynamic port from server provider. This is a test message.");
 });
