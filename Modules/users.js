var express = require('express');
var router = express.Router();
var DButilsAzure = require('../DButils');

module.exports = router;


//retrievePassword dsad
router.post('/retrievePassword', function(req,res) {
    var un = req.body.Username;
    var q1 = req.body.Q1;
    var a1 = req.body.A1;
    var q2 = req.body.Q2;
    var a2 = req.body.A2;
    
    //DButilsAzure.execQuery("select Password from Users where Username='" + un + "' AND Q1='" + q1 + "' AND A1='"+a1+"' AND Q2='" + q2+"' AND A2='"+a2+"'").then(function(response){
    DButilsAzure.execQuery("select * from Users where Username='" + un + "'").then(function(response){
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




