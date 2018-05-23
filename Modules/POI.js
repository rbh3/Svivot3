var express = require('express');

var router = express.Router();

module.exports = router;

//POIs


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