//this is only an example, handling everything is yours responsibilty !

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
app.use(cors());
var DButilsAzure = require('./DButils');
var users = require('./Modules/users');
var POI = require('./Modules/POI');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/users', users);
app.use('/POI', POI);

function getPOIbyID(id) {
    DButilsAzure.execQuery("select * from POI where ID='" + id + "'").then(function(response){
        res.send(response);
    }).catch(function(err){
        res.send(err);
    })
}

app.get('/getPOIbyID/:id', function(req, res) {
    DButilsAzure.execQuery("select * from POI where ID='" + req.params.id + "'").then(function(response){
        //res.json(response[0].ID);
        
    }).catch(function(err){
        res.send(err);
    })
});

    




var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
})


//-------------------------------------------------------------------------------------------------------------------


