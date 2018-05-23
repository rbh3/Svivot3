//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var DButilsAzure = require('./DButils');
var users = require('./Modules/users');
var POI = require('./Modules/POI');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/users', users);
app.use('/POI', POI);


app.post('/', function(req,res) {
    var un = req.body.Username;
    DButilsAzure.execQuery("select * from Users where Username='" + un + "'").then(function(response){
        res.send(response)
    }).catch(function(err){
        res.send(err);
    })
});

var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
})


//-------------------------------------------------------------------------------------------------------------------


