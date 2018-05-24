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
app.use('/reg/POI', POI);
// use morgan to log requests to the console
app.use(morgan('dev'));

var  superSecret = "dorRavid12"; // secret variable

app.use('/reg', function (req, res, next) {
    console.log("INSIDEEEEEE000")
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, superSecret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                // get the decoded payload and header
                var decoded = jwt.decode(token, {complete: true});
                req.decoded= decoded;
                console.log(decoded.header);
                console.log(decoded.payload)
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
})

var port = 3000;
app.listen(port, function () {
    console.log('Example app listening on port ' + port);
})


//-------------------------------------------------------------------------------------------------------------------


