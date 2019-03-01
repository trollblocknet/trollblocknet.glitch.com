// ************************************************************************************
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
//
//                 #TROLLBLOCKNET REPORTING SYSTEM BACKEND VERSION 1.6
//  
//                           AUTHOR: @TROLLBLOCKNET (Twitter)
//        
//                        Read the README.md file for details
//
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
// ************************************************************************************


// ************************************************************************************
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
//
//                                       GLOBALS
//
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
// ************************************************************************************


// ************************************************************************************

//                                       REQUIRES 

// ************************************************************************************

const amqp = require('amqplib');
var Twitter = require('twitter'); 
var functions = require('./functions');

// ************************************************************************************

//                                         VARS

// ************************************************************************************

var report_timestamp = "NULL";
var screen_name = "NULL";
var tw_userID = "NULL";
var tweetID = "NULL";
var list = "NULL";
var comments = "NULL";
var currentItem = "NULL";

// ************************************************************************************
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
//
//                                         MAIN
//
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
// ************************************************************************************


// ************************************************************************************

//                                     DATABASE INIT

// ************************************************************************************

// server.js
// where this node app starts

// init project
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var dbApp = express();
dbApp.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
dbApp.use(express.static('public'));

// init sqlite db
var fs = require('fs');
//var dbFile = './.data/tbn_reports2.db';
var dbFile = './.data/tbn_reports3.db';
var exists = fs.existsSync(dbFile); 
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE Reports (report_timestamp TEXT,screen_name TEXT,tw_userID TEXT,tweetID TEXT,list TEXT,comments TEXT,PRIMARY KEY (tweetID))');
   
    functions.log('New table "Reports" created!');
    
    db.run('CREATE TABLE Trolls (tw_userID TEXT, PRIMARY KEY (tw_userID))');
    functions.log('New table "Trolls" created!');
    
    db.run('CREATE TABLE Regim (tw_userID TEXT, PRIMARY KEY (tw_userID))');
    functions.log('New table "Regim" created!');
    
    db.run('CREATE TABLE IBEX (tw_userID TEXT, PRIMARY KEY (tw_userID))');
    functions.log('New table "IBEX" created!');
    
  }
  else {
    functions.log('[tbc.sqlite] : Database "tbc-reports" ready to go!');
  }
});


// ************************************************************************************

//                                     RENDER HTML 

// ************************************************************************************


// http://expressjs.com/en/starter/basic-routing.html
dbApp.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

const whitelist = ['http://trollblocknet.cat']
const corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

////////
// SERVE HTTP /getReports REQUESTS
///////

dbApp.get('/getReports', cors(corsOptions), function (request, response) {
  
      
// ---------------------------------------------------

//         TWITTER IMPORT & DB UPDATE EVERY 
//            TIME A GET REQUEST IS MADE 

// ---------------------------------------------------
    
  
    //-------------- @TROLLBLOCKCHAIN -----------------

    var client = new Twitter({
      consumer_key: process.env.TROLLBLOCKCHAIN_TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TROLLBLOCKCHAIN_TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TROLLBLOCKCHAIN_TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TROLLBLOCKCHAIN_TWITTER_ACCESS_TOKEN_SECRET
    });
    let dbTable1 = "Trolls"
    functions.retrieveTwitterBlocksAndUpdateDB2(db,dbTable1,client); 
  
    //functions.retrieveTwitterFollowers(client,"MovFranquista") // --> ACTIVATE ONLY ON DEMAND TO RETRIEVE THE FOLLOWERS OF ONE TROLL TO public/followers.csv
       
    
    //-------------- @XUSMABLOCKNET -----------------
  
  
    var client = new Twitter({
      consumer_key: process.env.XUSMABLOCKNET_TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.XUSMABLOCKNET_TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.XUSMABLOCKNET_TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.XUSMABLOCKNET_TWITTER_ACCESS_TOKEN_SECRET
    });
    let dbTable2 = "Regim";
    functions.retrieveTwitterBlocksAndUpdateDB2(db,dbTable2,client); 
  
    
    //-------------- @IBEXBLOCKNET -----------------


      var client = new Twitter({
      consumer_key: process.env.IBEXBLOCKNET_TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.IBEXBLOCKNET_TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.IBEXBLOCKNET_TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.IBEXBLOCKNET_TWITTER_ACCESS_TOKEN_SECRET
    });
    let dbTable3 = "IBEX";
    functions.retrieveTwitterBlocksAndUpdateDB2(db,dbTable3,client); 
  

// ---------------------------------------------------

//                 PERFORM DB QUERY

// ---------------------------------------------------
    
    
  let dbQuery = "SELECT * FROM Reports WHERE NOT EXISTS "+
                        "(SELECT tw_userID FROM Trolls WHERE Reports.tw_userID = Trolls.tw_userID "+
				                 "UNION "+
				                 "SELECT tw_userID FROM Regim WHERE Reports.tw_userID = Regim.tw_userID "+
				                 "UNION "+
				                 "SELECT tw_userID FROM Ibex WHERE Reports.tw_userID = Ibex.tw_userID)";
  
  
  db.all(dbQuery, function(err, rows) {
    if (err) { functions.log(console.error(err)) }
    response.send(JSON.stringify(rows));
    //response.json(rows);
  });
  
});
////////////
/// SERVE HTTP /getTotals REQUESTS
///////////

dbApp.get('/getTotals', cors(corsOptions), function (request2, response2, next2) {
  
  var totalTrollsBlocked = functions.getTotalBlocks("Trolls");
  var totalRegimBlocked = functions.getTotalBlocks("Regim");
  var totalIBEXBlocked = functions.getTotalBlocks("IBEX");
  
  /*var trollsTimestamp = functions.getTimestamp("Trolls");
  var regimTimestamp = functions.getTimestamp("Regim");
  var IBEXTimestamp = functions.getTimestamp("IBEX");*/
   
   var totals = [
     {
       "list": '<p style="text-align:center;\">Trolls unionistes i \"Infilitrats Indepes\"<\/p>',
       "total": '<span style="font-size:24px;font-weight:bold;\">'+totalTrollsBlocked+'<\/span>',
       "subscriptionLink": '<a href=\"http://trollblocknet.cat/subscripcio/trolls/\" target=\"blank_\">Subscriure\'m-hi</a>',
       "csvLink": '<a href=\"http://trollblocknet.cat/llistes/trolls.zip\" target=\"blank_\">trolls.zip</a>'
       //"timestamp": trollsTimestamp
     },
     {
       "list": '<p style="text-align:center;\">Col·laboradors amb el \"Règim del 78\"<\/p>',
       "total": '<span style="font-size:24px;font-weight:bold;\">'+totalRegimBlocked+'<\/span>',
      "subscriptionLink": '<a href=\"http://trollblocknet.cat/subscripcio/regim78/\" target=\"blank_\">Subscriure\'m-hi</a>',
       "csvLink": '<a href=\"http://trollblocknet.cat/llistes/regim78.zip\" target=\"blank_\">regim78.zip</a>'
       //"timestamp": regimTimestamp
     },
     {
       "list": '<p style="text-align:center;\">Empreses de l\'IBEX-35 i financeres del Règim<\/p>', 
       "total": '<span style="font-size:24px;font-weight:bold;\">'+totalIBEXBlocked+'<\/span>',
       "subscriptionLink": '<a href=\"http://trollblocknet.cat/subscripcio/trolls/\" target=\"blank_\">Subscriure\'m-hi</a>',
       "csvLink": '<a href=\"http://trollblocknet.cat/llistes/IBEX35.zip\" target=\"blank_\">IBEX35.zip</a>'
       //"timestamp": IBEXTimestamp
     }
    ];

   //console.log("TOTALS: "+JSON.stringify(totals));
   response2.send(JSON.stringify(totals));

});


////////
// SERVE HTTP /getReports REQUESTS
///////

dbApp.get('/getRecents', cors(corsOptions), function (request, response) {
  
// ---------------------------------------------------

//                 PERFORM DB QUERY

// ---------------------------------------------------
    
    
  let dbQueryRecents = "SELECT DISTINCT screen_name, list, report_timestamp FROM Reports WHERE EXISTS "+
                        "(SELECT tw_userID FROM Trolls WHERE Reports.tw_userID = Trolls.tw_userID "+
				                 "UNION "+
				                 "SELECT tw_userID FROM Regim WHERE Reports.tw_userID = Regim.tw_userID "+
				                 "UNION "+
				                 "SELECT tw_userID FROM Ibex WHERE Reports.tw_userID = Ibex.tw_userID) "+
                         "ORDER BY report_timestamp "+
                         "LIMIT 10";
  
  
  db.all(dbQueryRecents, function(err, rows) {
    if (err) { functions.log(console.error(err)) }
    response.send(JSON.stringify(rows));
    //response.json(rows);
  });
  
});


// listen for requests :)
var listener = dbApp.listen(process.env.PORT, function() {
  functions.log('[tbc.sqlite] : db app is listening on port ' + listener.address().port + '....');
});


// ************************************************************************************

//            RETRIEVE MESSAGES FROM CLOUDAMQP QUEUE AND STORE IN DB

// ************************************************************************************


let channel = null;
const rabbitUrl = process.env.RABBITURL;
const rabbitQueue = process.env.RABBITQUEUE;

const getvalue = (regex, string) => {
  const match = regex.exec(string);
  return match ? match.pop() : null;
};

const connect = async () => {
  const connection = await amqp.connect(`${rabbitUrl}`);
  channel = await connection.createChannel();
  await channel.prefetch(2);
  await channel.assertQueue(rabbitQueue);

  channel.consume(rabbitQueue, msg => {
    const message = msg.content.toString();
    functions.log("[tbc.amqplib] : Message Received --> "+message);    
    
// ************************************************************************************

//              PARSE AMQP MESSAGE AND INSERT ROW IN REPORTS DB TABLE

// ************************************************************************************
    
    //DISECT MESSAGE IN 4 VARIABLES 
    var disectedMessage = message.toString().split(";");
    
    console.log("TIMESTAMP -----------------------------------------------> "+disectedMessage[0]);
    report_timestamp = disectedMessage[0];
    screen_name = disectedMessage[1];
    tw_userID = disectedMessage[2];
    tweetID = disectedMessage[3];
    list = disectedMessage[4];
    comments = disectedMessage[5];
      
    //INSERT DISECTED MESSAGE VARIABLES, TWITTER USER ID & POST DATA RECEIVED IN A NEW DB ROW
    db.serialize(function() {
      
      db.run('INSERT INTO Reports (report_timestamp,screen_name,tw_userID,tweetID,list,comments) VALUES (?,?,?,?,?,?)',report_timestamp,screen_name,tw_userID,tweetID,list,comments,function(err){
        if(err){
          let logEntry ='[tbc.sqlite] : ERROR! : '+ err.message+' --> '+tweetID;
          return functions.log(logEntry); 
        }
        functions.log(`[tbc.sqlite] : Rows inserted in Reports Table -> ${this.changes}`);
      });
    });
    
    
// ************************************************************************************

//                             CLOSE RABBITAMQP CONNECTION

// ************************************************************************************
      

    fakeApi(message)
      .then(response => {
        channel.ack(msg);
        functions.log("[tbc.amqplib] : Ack is done "+message);
      })
      .catch(error => {
        functions.log(console.error("[tbc.amqplib] : fakeApi", { error, message }));
      });
  });

  channel.on("error", error => {
    functions.log(console.error("[tbc.amqplib] : connection error", error));
  });

  channel.on("close", () => {
    const retryTimeoutMs = 30000;
    functions.log(console.info(`[tbc.amqplib] : connection closed, retrying in ${retryTimeoutMs / 1000}s...`));
    setTimeout(connect, retryTimeoutMs);
  });
};

const disconnect = async () => {
  await channel.close();
};

const fakeApi = async msg => {
  await sleep(1)
};

const sleep = s =>
  new Promise(res => {
    setTimeout(res, s * 1000);
  });

module.exports = {
  connect,
  disconnect,
};


// ************************************************************************************
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
//
//                                     THE END
//
// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// \\_// 
// ************************************************************************************

  
  
