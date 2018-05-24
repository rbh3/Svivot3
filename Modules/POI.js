var express = require('express');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var router = express.Router();
var DButilsAzure = require('../DButils');
module.exports = router;
// use morgan to log requests to the console
router.use(morgan('dev'));

var  superSecret = "dorRavid12"; // secret variable


//Check Token
router.use('/reg', function (req, res, next) {
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

//POIs


router.get('/reg/FavoritesByUsername/', function(req,res,next) {
    var un = req.decoded.payload.userName;
    DButilsAzure.execQuery("select POIid from FavoritePoi where Username='" + un + "' order by Date desc").then(function(response){
    res.send(response);
    //res.send("Not Found")
    }).catch(function(err){
        res.send(err);
    })
});