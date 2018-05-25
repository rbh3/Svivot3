var express = require('express');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var router = express.Router();
var DButilsAzure = require('../DButils');
module.exports = router;
// use morgan to log requests to the console
router.use(morgan('dev'));

var superSecret = "dorRavid12"; // secret variable


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
                var decoded = jwt.decode(token, { complete: true });
                req.decoded = decoded;
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

function getPOIbyID(id) {
    return new Promise(function (resolve, reject) {
        DButilsAzure.execQuery("select * from POI where ID='" + id + "'").then(function (responsePOI) {
            if(responsePOI.length===0)
            {
                resolve("NO RESULTS!!!")
                return;
            }
            let poi = responsePOI[0];
            return DButilsAzure.execQuery("select Rank, body, Date from ReviewsPoi where POIid=" + id + " order by Date desc").then(function (responseREV) {
                let rev = responseREV;
                let lastTwo = [];
                for (let i = 0; (i < responseREV.length && i < 2); i++) {
                    lastTwo[i] = responseREV[i];
                }
                let returnPOI = {
                    "Name": poi.Name,
                    "Description": poi.Description,
                    "Rank": poi.Rank,
                    "CategoryID": poi.CatID,
                    "UsersWatching": poi.UserWaching,
                    "Picture": poi.Picture,
                    "Reviews": lastTwo
                }
                resolve(returnPOI);
            }).catch(function (err) {console.log (err) })
        }).catch(function (err) { console.log (err)})
    });
}

router.get('/reg/getPOIbyID/:id', function (req, res) {
    getPOIbyID(req.params.id).then(function (response) {
        if(response==="NO RESULTS!!!")
        {
            res.json(response);
            return;
        }
        DButilsAzure.execQuery("update POI set UserWaching=" + (response.UsersWatching + 1) + " where ID=" + req.params.id).then(function (response) {
        }).catch(function (err) { })
        res.json(response);
    })
});

router.get('/reg/getPOIbyName/:name', function (req, res) {
    DButilsAzure.execQuery("select ID from POI where Name LIKE '%"+req.params.name+"%'").then(function (response) {
        if(response.length===0)
        {
            res.json("NO RESULTS!!!");
            return;
        }
        else
        {
            let retArr = [];
            let promiseArr=[];
            for (let i = 0; i <response.length ; i++) {
                promiseArr[i]=new Promise(function(resolve,reject){
                resolve(getPOIbyID(response[i].ID))
            })}
            Promise.all(promiseArr).then(function(values){
                res.send(values);
            })
        }
    }).catch(function (err) { console.log(err) })
});

router.get('/reg/getAllPOI/', function (req, res) {
    DButilsAzure.execQuery("select ID from POI").then(function (response) {
        if(response.length===0)
        {
            res.json("NO RESULTS!!!");
            return;
        }
        else
        {
            let retArr = [];
            let promiseArr=[];
            for (let i = 0; i <response.length ; i++) {
                promiseArr[i]=new Promise(function(resolve,reject){
                resolve(getPOIbyID(response[i].ID))
            })}
            Promise.all(promiseArr).then(function(values){
                res.send(values);
            })
        }
    }).catch(function (err) { console.log(err) })
});

router.get('/Random3', function (req, res) {
    DButilsAzure.execQuery("select ID from POI").then(function (responseID) {
        let retArr = [];
        let usedrans=[];
        let count=0;
        let promiseArr=[];
        for (let i = 0; i <3 ; i++) {
            promiseArr[i]=new Promise(function(resolve,reject){
            let tmpID = Math.floor(Math.random() * (responseID.length));
            while(usedrans.includes(tmpID))
                tmpID = Math.floor(Math.random() * (responseID.length));
            usedrans[count]=tmpID;
            count++
            resolve(getPOIbyID(responseID[tmpID].ID))
            })
        }
  /*      var promise1=new Promise(function(resolve,reject) {
            let tmpID = Math.floor(Math.random() * (responseID.length));
            while(usedrans.includes(tmpID))
                tmpID = Math.floor(Math.random() * (responseID.length));
            usedrans[count]=tmpID;
            count++
            resolve(getPOIbyID(responseID[tmpID].ID))
        })
        var promise2=new Promise(function(resolve,reject) {
            let tmpID = Math.floor(Math.random() * (responseID.length));
            while(usedrans.includes(tmpID))
                tmpID = Math.floor(Math.random() * (responseID.length));
            usedrans[count]=tmpID;
            count++
            resolve(getPOIbyID(responseID[tmpID].ID))
        })
        var promise3=new Promise(function(resolve,reject) {
            let tmpID = Math.floor(Math.random() * (responseID.length));
            while(usedrans.includes(tmpID))
                tmpID = Math.floor(Math.random() * (responseID.length));
            usedrans[count]=tmpID;
            count++
            resolve(getPOIbyID(responseID[tmpID].ID))
        })*/
        Promise.all(promiseArr).then(function(values){
            res.send(values);
        })
    })
      /*  for (let i=0; i<3; i++) {
            let tmpID = Math.floor(Math.random() * (responseID.length));
            getPOIbyID(responseID[tmpID].ID).then(function (responsePOI) {
                    retArr[i] = responsePOI;
                if (i === 2)
                    res.json(retArr);
            }).catch(function (err) { console.log (err)})            
        }
    })*/
})


router.get('/reg/FavoritesByUsername/:num', function (req, res, next) {
    let un = req.decoded.payload.userName;
    DButilsAzure.execQuery("select POIid from FavoritePoi where Username='" + un + "' order by Date desc").then(function (response) {
        if(response.length==0)
        {
            res.send("No Favorite");
            return
        }
        let retArr = [];
        if (req.params.num === '2') {
            let promiseArr=[];
            for (let i = 0; (i < 2 && i < response.length); i++) {
                promiseArr[i]=new Promise(function(resolve,reject){
                    resolve(getPOIbyID(response[i].POIid))
                })
            }
            Promise.all(promiseArr).then(function(values){
                res.send(values);
            })
        }
        else {
            let promiseArr=[];
            for (let i = 0; (i < response.length); i++) {
                promiseArr[i]=new Promise(function(resolve,reject){
                    resolve(getPOIbyID(response[i].POIid))
                })
              /*  getPOIbyID(response[i].POIid).then(function (resPOI) {
                    retArr[i] = resPOI;
                    if (i === response.length - 1)
                        res.json(retArr);
                })*/
            }
            Promise.all(promiseArr).then(function(values){
                res.send(values);
            })
        }
    });
});

router.get('/reg/get2byCat/', function (req, res, next) {
    let un = req.decoded.payload.userName;
    let categories=req.decoded.payload.categories;
    let randCat1 = Math.floor(Math.random() * (categories.length));
    let randCat2 = Math.floor(Math.random() * (categories.length));
    while(randCat1===randCat2)
         randCat2 = Math.floor(Math.random() * (categories.length));
    let retArr = [];
    let promiseArr=[];
    DButilsAzure.execQuery("select ID from POI where CatID='" + categories[randCat1]+"' And Rank>=60").then(function (response) {
            promiseArr[0]=new Promise(function(resolve,reject){
                if(response.length===0)
                {
                    resolve("No Result in this Category");
                }
                else
                {
                    let tmpID = Math.floor(Math.random() * (response.length));
                    resolve(getPOIbyID(response[tmpID].ID))
                }
            })
         DButilsAzure.execQuery("select ID from POI where CatID='" + categories[randCat2]+"' And Rank>=60").then(function (response) {
        promiseArr[1]=new Promise(function(resolve,reject){
            if(response.length===0)
            {
                resolve("No Result in this Category");
            }
            else
            {
                let tmpID = Math.floor(Math.random() * (response.length));
                resolve(getPOIbyID(response[tmpID].ID))
            }
        })
        Promise.all(promiseArr).then(function(values){
            res.send(values);
        })
    })
    })
     
});

//storeFavorites
router.post('/reg/storeFav', function (req, res, next) {
    DButilsAzure.execQuery("Delete from FavoritePoi where Username='" + req.decoded.payload.userName + "'").then(function (response) {
        let favorites = req.body.favorites;
        let today = new Date().toISOString();
        for (var i = 0; i < favorites.length; i++) {
            DButilsAzure.execQuery("insert into FavoritePoi (Username, POIid, Date) values ('" + req.decoded.payload.userName + "'," + favorites[i] + ",'" + today + "')").then(function (response) {
                console.log("Favorite Added")
            }).catch(function (err) {
                res.send(err);
            })
        }
        res.send("Favorite list Updated");
    }).catch(function (err) {
        res.send(err);
    })
})

//addRank
router.post('/reg/addRank/', function (req, res, next) {
    var id = req.body.id
    var rank = req.body.rank
    var body = req.body.body
    var today = new Date().toISOString();
    var sum = 0;
    DButilsAzure.execQuery("insert into ReviewsPoi (POIid,Rank,body,Date,Username) values (" + id + "," + rank + ",'" + body + "','" + today+"','"+req.decoded.payload.userName+"')").then(function (response) {
        console.log("Review Added")
        DButilsAzure.execQuery("select Rank from ReviewsPoi where POIid=" + id).then(function (response) {
        for (var i = 0; i < response.length; i++) {
            sum += response[i].Rank;
        }
        sum = (sum / (response.length * 5)) * 100;

        DButilsAzure.execQuery("Update POI set Rank=" + sum + " where ID=" + id).then(function (response) {
            console.log("Review Calculated")
            res.send("Review Added")
        })
    }).catch(function (err) {
        res.send(err);
    })
    }).catch(function(err)
    {
        res.send("The same review from this user exists");
    })
   
})