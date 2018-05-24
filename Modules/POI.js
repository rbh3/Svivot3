var express = require('express');

var router = express.Router();
var DButilsAzure = require('../DButils');
module.exports = router;

//POIs


router.get('/FavoritesByUsername/:un', function(req,res,next) {
   console.log("CHECKKK SUCCESSSS")
    var un = req.params.un;
    DButilsAzure.execQuery("select POIid from FavoritePoi where Username='" + un + "' order by Date desc").then(function(response){
    res.send(response);
    //res.send("Not Found")
    }).catch(function(err){
        res.send(err);
    })
});