var express = require('express');
var http = require('http');
var cors = require('cors');
var path = require('path');
var fs = require("fs");
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j= require('neo4j-driver').v1;
var childProcess = require('child_process');
var {PythonShell} = require('python-shell');


var app = express();
//app.use(cors());
app.use(cors({
    origin: 'http://pnv6w1142:3000'
  }));

//views
 app.set('views',path.join(__dirname,'views'));
 app.set('view engine','ejs');
 app.use(logger('dev'));

 app.use(function(req, res, next) {
    var allowedOrigins = ['http://pnv6w1142:3000', 'http://pni6w11855:3000', 'http://localhost:9000','http://10.134.94.161:7001'];
    var origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
    }
    //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    //res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Credentials', true);
    return next();
  });
app.use(bodyParser.json());

// Tell express to use the body-parser middleware and to not parse extended bodies
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'public')));
app.listen(9000);
console.log('server started at port 9000');

app.get('/',function(req,res){
res.sendFile( __dirname + "/" + "index.htm" );
});


app.get('/addPlayer.htm',function(req,res){
    res.sendFile( __dirname + "/" + "addPlayer.htm" );
    });

    
app.get('/debutPlayer.htm',function(req,res){
    res.sendFile( __dirname + "/" + "debutPlayer.htm" );
    });

var driver = neo4j.driver('bolt://localhost:7687',neo4j.auth.basic('neo4j','ne04j'));
var session = driver.session();



//get prediction data From ne04j
app.get('/calculatePrediction', function (req, res) {
    console.log("requestParam:   " + req.query.uid);
    var options = {
        args: [req.query.uid]
    }
    var spawn = childProcess.spawn;
    var process = spawn('python', ["./predict.py"]);
    PythonShell.run('./predict.py', options, function (err, data) {
        if (err) {
            res.send(err)
        };
        console.log("python response:   " + data);
        res.send(data);
    });
});

//get country data From ne04j
app.get('/getAllPrediction', function (req, res) {
    console.log("request"+ req);
    // res.header("Access-Control-Allow-Origin", "http://pnv6w1142:3000"); // update to match the domain you will make the request from
    // res.header('Access-Control-Allow-Credentials',true);
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var query = "MATCH (p:Predict ) return p LIMIT 25";
    console.log('query formed: '+ query)
    var predictions = [];
    session.run(query)
        .then(function (results) {
            results.records.forEach(function (record) {
                console.log(record._fields[0].properties);
                predictions.push(record._fields[0].properties);
            });
            res.send(predictions);
        })
        .catch(function (err) {
            console.log(err);
        });
});

//get country data From ne04j
app.get('/addPlayer', function (req, res) {
    console.log(req);
    var query = "create (p:player {name:" + "\'" + req.query.name + "\'" + ",YOB:"  + req.query.yob  + ",POB:" + "\'" + req.query.pob + "\'" + "})" + "return p";
    console.log('query formed: '+ query)
    var player =null;
    session.run(query)
        .then(function (results) {
            results.records.forEach(function (record) {
                console.log(record._fields[0].properties);
                player= record._fields[0].properties;
            });
            res.send(player);
        })
        .catch(function (err) {
            console.log(err);
        });
});

//get country data From ne04j
app.get('/debutPlayer', function (req, res) {
    var query = "create (p:player {name:" + "\'" + req.query.name + "\'" + ",YOB:"  + req.query.yob  + ",POB:" + "\'" + req.query.pob + "\'" + "})" + "return p";
   // var query = "MATCH(p:player),(c:country) where p.name="+"\'"+req.query.name +"\'"+ "and c.name ="+"\'"+ req.query.country+ "\'" +"CREATE (p)-[r:PLAYFOR]->(c)";
   //MATCH(p:player), (c:country) where p.name='Sehwag'and c.name='india' CREATE (p)-[r:PLAYFOR]->(c) return p,c
    var query = "MATCH(p:player),(c:country) where p.name="+"\'"+req.body.name +"\'"+ "and c.name ="+"\'"+ req.body.country+ "\'" +"CREATE (p)-[r:PLAYFOR]->(c) return p,c";
    console.log('query formed: '+ query)
    var player =null;
    session.run(query)
        .then(function (results) {
            results.records.forEach(function (record) {
                console.log(record._fields[0].properties);
                player = record._fields[0].properties;
            });
            res.send(player);
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.get('/countryList', function (req, res) {
    var query = "MATCH (c:country) return c LIMIT 25";
    var countries = [];
    session.run(query)
        .then(function (results) {
            results.records.forEach(function (record) {
                console.log(record._fields[0].properties);
                countries.push(record._fields[0].properties);
            });
            res.send(countries);
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.get('/playerList', function (req, res) {
    var query = "MATCH (p:player) return p LIMIT 25";
    var countries = [];
    session.run(query)
        .then(function (results) {
            results.records.forEach(function (record) {
                console.log(record._fields[0].properties);
                countries.push(record._fields[0].properties);
            });
            res.send(countries);
        })
        .catch(function (err) {
            console.log(err);
        });
});
 app.get('/getPlayer', function (req, res) {
     var query = "MATCH (p:player) return p LIMIT 25";
     var countries = [];
     session.run(query)
         .then(function (results) {
             results.records.forEach(function (record) {
                 console.log(record._fields[0].properties);
                 countries.push(record._fields[0].properties);
             });
             res.send(countries);
         })
         .catch(function (err) {
             console.log(err);
         });
 });

module.exports = app;