var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var DButilsAzure = require('../DButils');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
// use body parser so we can get info from POST and/or URL parameters
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
// use morgan to log requests to the console
router.use(morgan('dev'));

var  superSecret = "dorRavid12"; // secret variable

module.exports = router;

//retrievePassword
router.post('/retrievePassword', function(req,res) {
    var un = req.body.Username;
    var q1 = req.body.Q1;
    var a1 = req.body.A1;
    var q2 = req.body.Q2;
    var a2 = req.body.A2;
    
    //DButilsAzure.execQuery("select Password from Users where Username='" + un + "' AND Q1='" + q1 + "' AND A1='"+a1+"' AND Q2='" + q2+"' AND A2='"+a2+"'").then(function(response){
    DButilsAzure.execQuery("select * from Users where Username='" + un + "'").then(function(response){
        if(response.length===0)
            res.send("user not found")
        if ((response[0].Q1 === q1) && (response[0].A1 === a1) && (response[0].Q2 === q2) && (response[0].A2 === a2))   
            res.send(response[0].Password);
        else
            res.send("Not Found")
    }).catch(function(err){
        res.send(err);
    })
});

//addUser
router.post('/', function(req,res) {
    DButilsAzure.execQuery("Select * from Users where Username='"+req.body.Username+"'").then(function(response){
        if(response.length!=0)
        {
            res.send("Username already exists, please choose another")
        }        
        else
        {
            DButilsAzure.execQuery("insert into Users (Username, Password, Fname, Lname, City, Country, [E-mail], Q1, A1, Q2, A2) VALUES "+
            "('"+req.body.Username+"','"+req.body.Password+"','"+req.body.Fname+"','"+req.body.Lname+"','"+req.body.City+"','"+req.body.Country+"','"+req.body.Email+"','"+req.body.Q1+"','"+req.body.A1+"','"+req.body.Q2+"','"+req.body.A2+"')").then(function(response){
            console.log("User Added")})
            //Categories ADD
            let ctgrsLen = req.body.categories.length;
            for (let i=0; i<ctgrsLen; i++)
            {
                if(req.body.categories[i]==0)
                    continue
                DButilsAzure.execQuery("insert into CategoryUser (Username, CatID) VALUES "+
                "('"+req.body.Username+"',"+req.body.categories[i]+")").then(function(response){
                console.log("Categ Added")
                })
            }
            res.send(200);            
        }
    }).catch(function(err){
        res.send(err);
    })
    
});

//LOGIN
router.post('/authenticate', function (req, res) {

    if (!req.body.userName || !req.body.password)
        res.send({ message: "bad values" })

    else {
        DButilsAzure.execQuery("select * from Users where Username='" + req.body.userName + "'").then(function(response){
            if (response.length==0)  
                res.send({ success: false, message: 'Authentication failed. No such user name' }) 
            else
            {
                if (req.body.password == response[0].Password)
                     sendToken(response, res)
                else 
                {
                    res.send({ success: false, message: 'Authentication failed. Wrong Password' })
                    return
                }
            }     
        }).catch(function(err){
            res.send(err);
        })  
    }

})

function sendToken(user, res) {
    let categories=[];
    DButilsAzure.execQuery("select * from CategoryUser where Username='" + user[0].Username + "'").then(function(response){
        for(var i=0; i<response.length;i++)
        {
            categories[i]=response[i].CatID;
        }

          
    var payload = {
        userName: user[0].Username,
        categories: categories
    }

    var token = jwt.sign(payload, superSecret, {
        expiresIn: "1d" // expires in 24 hours
    });

    // return the information including token as JSON
    res.json({
        success: true,
        message: 'This is your token!',
        token: token
    });

    return;

    }).catch(function(err){
        res.send(err);
    });  
}