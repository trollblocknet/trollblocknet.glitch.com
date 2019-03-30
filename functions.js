  
// ************************************************************************************

//                                    FUNCTIONS

// ************************************************************************************

var Twitter = require('twitter'); 
var fs = require('fs');
var AdmZip = require('adm-zip');

module.exports = {
  
  ////////// START


// ---------------------------------------------------
// Function: retrieveTwitterBlocksAndUpdateDB3
// Description: Same as 2 but using buffers instead of tmp.csv files
// Input: db,table,client
// Output: N/A
// ---------------------------------------------------
 
retrieveTwitterBlocksAndUpdateDB3: function (db,table,client){
   
  // DEFINE & INITIALIZE VARIABLES
  var i = 1;
  var x = 0;
  var totalBlocks = 0;
  var filename;
  
  // CREATE ZIP ARCHIVE VAR
  var zip = new AdmZip();

  // RECURSIVE FUNCTION THAT RETRIEVES ALL BLOCKED PROFILES FROM TWITTER (IMPLEMENTS CURSORING / PAGINATION) 
  var params = {count: '4000', cursor:  -1, stringify_ids: true };
  client.get('blocks/ids', params, function getlist(error, list, response) 	
  {
     if (error) {
       // IF THE GET REQUEST DOES NOT HAVE A SUCCESS RESPONSE, ABORT
       console.error(error);
     }
     else
     { 
      // PERFORM ACTIONS FOR THIS BATCH:

      // FIRST WE INSERT ALL THE PROFILES ID'S WE RECEIVED FROM THIS BATCH TO THE BD
      updateBlockedTable(db,list.ids,table); 
       
      // NOW WE ADD THE PAGE DATA TO THE ZIP FILE
      filename = table + i;
      var content = ''; 
      for (x=0;x<list.ids.length;x++){ 
        content += list.ids[x]+'\n';
      }
      totalBlocks += x;
      zip.addFile(filename+".csv", Buffer.alloc(content.length, content), "@TrollBlockNet");
      // add local file
       
       // FINALLY WE RECURSIVELY CALL THE GET FUNCTION WE JUST DEFINED AVOBE SO WE CAN GET THE NEXT 
       // BATCH (CURSOR) IN A SYNCHRONIZED WAY (REQUEST ARE DONE SEQUENTIALLY) 
       if(list.next_cursor != 0) 
       {
         i++;
         params.cursor = list.next_cursor
         client.get('blocks/ids',params, getlist);
       }
       else
       {
         // IF IT's THE LAST BATCH, PACK IT ALL INTO A ZIP FILE
         zip.writeZip("./public/"+table+".zip");
         
         // FINALLY WE SAVE THE TOTALBLOCKS VAR IN THE FS TO BE USED BY /getTotals
         setTotalBlocks(totalBlocks,table);
       }
    }   
}); 
  
},
  
  // ---------------------------------------------------
// Function: getTwitterFollowers(client,tw_userID)
// Description: downoad the followers lists of tw_userID into a CSV file
// Input: client --> Twitter API connection object 
//        tw_userID --> user to download its followers 
// Output: N/A
// ---------------------------------------------------


retrieveTwitterFollowers: function (client,screenName){
  
  // IMPORT TWITTER BLOCKED PROFILES INTO INTO DB 
  
  client.get('/followers/ids.json?cursor=-1&screen_name='+screenName+'&count=5000', function(error, profiles, response) {
  if(error) {
    //throw error  
    //let logEntry = "[tbc.twitter] : ERROR! : "+error.message;
    //log(logEntry);
    return console.error(error);
     
  }else{
    log('[tbc.twitter] : followers of '+screenName+' profiles list received' );  
  };  
  
  let filename = "followers";
  
  updateCSV(profiles.ids,filename);
   
   return;
  //console.log(response);  // Raw response object.
  
});
},

  // ---------------------------------------------------
// Function: log(String)
// Description: Shows a log event in the server log console and saves it in /app/.data/console.log with current timestamp
// Input: String --> Console message
// Output: N/A
// -----------------------------------------------------

log: function (message){
  
  var fs = require('fs');
  const path = './.data/console.log';
  let exists = fs.existsSync(path);
  var output;
  //if file ./data/console.log does not exist
  if (fs.existsSync(path) == false){
    fs.writeFile(path, timestamp()+' : '+message+'\n', (err) => {
    if (err) throw err;
    console.log(message);
    });
  } else { 
  //if it does   
    fs.appendFile(path, timestamp()+' : '+message+'\n', (err) => {
    if (err) throw err;
    console.log(message); 
    });
  }
  return;
},
  
  getTotalBlocks: function(filename){
    //Read number of rows in CSV and return value
    var totalBlocked = fs.readFileSync('./.data/total-blocks-'+filename+'.txt')
    return totalBlocked;
  },
  
  getTimestamp: function(filename){
    //Return CSV file creation date 
    let timestamp = filename+" timestamp";
    return timestamp;
  }
  
  
  ///////////END EXPORTS
  
};

////// START LOCALS

// ---------------------------------------------------
// Function:
// Description:
// Input:
// Output:
// ---------------------------------------------------
  
var updateBlockedTable = function (db,ids,table) { 
    
    let i;
    var n = 0;
    let sql = 'INSERT INTO '+table+' (tw_userID) VALUES (?)';
    for (i=0;i<=ids.length;i++)
    {   
      //INSERT ROW 
      db.serialize(function() {
        db.run(sql,ids[i], function(err) {
          if (err) {
            //return console.error(err.message);
            //return; 
          } else {
          n++;
          
          }  
        }          
        );       
      });         
    }
    log('[tbc.sqlite] : New ' +table+ ' rows inserted -> ' + n); 
    log('[tbc.sqlite] : Total ' +table+ ' (profiles) blocked -> ' + ids.length); 
  return;
}

// ---------------------------------------------------
// Function: updateCSV
// Description: Appends all screen_name's followers id's in a csv file 
// Called by: retrieveTwitterFollowers()
// Input: ids, fileName
// Output: N/A
// ---------------------------------------------------

var updateCSV = function (ids,fileName){

  var wstream = fs.createWriteStream('./public/'+fileName+'.csv');
  let i;
  for (i=0;i<ids.length;i++)
  {
    wstream.write(ids[i]+'\n');
  }
  
  //wstream.write(ids+'');
  wstream.end();
}
    
// ---------------------------------------------------
// Function: timestamp()
// Description: gets the system's current date and returns a formatted timestamp string --> [HH:MM:SS dd:mm:yy]
// Input: N/A
// Output: String --> formatted 
// ---------------------------------------------------

var timestamp = function (){
  //return "dd/mm/yy-hh:MM"; 
  
process.env.TZ = 'Europe/Madrid';   
var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();
var H = date.getHours();
var M = date.getMinutes();

var timestamp = new String();
      
timestamp = H+':'+M+' '+d+'/'+m+'/'+y;
  
  return timestamp;
}

var log = function (message){
  
  const path = './.data/console.log';
  let exists = fs.existsSync(path);
  var output;
  //if file ./data/console.log does not exist
  if (fs.existsSync(path) == false){
    fs.writeFile(path, timestamp()+' : '+message+'\n', (err) => {
    if (err) throw err;
    console.log(message);
    });
  } else { 
  //if it does   
    fs.appendFile(path, timestamp()+' : '+message+'\n', (err) => {
    if (err) throw err;
    console.log(message); 
    });
  }
  return;
}

  var setTotalBlocks = function(totalBlocks,filename){
    fs.writeFile('./.data/total-blocks-'+filename+'.txt', totalBlocks, (err) => {
    if (err) throw err;
    });
  }


 // DEPRECATED FUNCTIONS - ARCHIVE
  
  
// ---------------------------------------------------
// Function: retrieveTwitterBlocksAndUpdateDB2 - DEPRECATED! (DO NOT DELETE JUST IN CASE WE ADD TROLMUT COMPATIBILITY)
// Description:
// Input: db,table,client
// Output: N/A
// ---------------------------------------------------
 
/*retrieveTwitterBlocksAndUpdateDB2: function (db,table,client){
   
  //DEFINE CSV PATHS AND VARIABLES
  var i = 1;
  var x = 0;
  var totalBlocks = 0;
  var csvPath = './public/tmp-'+table+'.csv';
  //var csvFilename = './public/'+table;
  var newCsvPath = './public/'+table+'.csv';
 // creating archives
  var zip = new AdmZip();
  
  //RESET TMP.CSV FILE BEFORE STARTING 
   var fileExists = fs.existsSync(csvPath);
   if (fileExists){
    fs.unlinkSync(csvPath, function (err) {
    if (err) {console.error(err.status);}
    else{ console.log('[tbc.fs] : File '+csvPath+' reset succesful');}
  });
  }
  
  //RECURSIVE FUNCTION THAT RETRIEVES ALL BLOCKED PROFILE FROM TWITTER (IMPLEMENTS CURSORING / PAGINATION) 
  var params = {count: '4000', cursor:  -1, stringify_ids: true };
  client.get('blocks/ids', params, function getlist(error, list, response) 	
  {
     if (error) {
       //IF THE GET REQUEST DOES NOT HAVE A SUCCESS RESPONSE, ABORT
       console.error(error);
     }
     else
     { 
      //PERFORM ACTIONS FOR THIS BATCH:

      //FIRST WE INSERT ALL THE PROFILES ID'S WE RECEIVED FROM THIS BATCH TO THE BD
      updateBlockedTable(db,list.ids,table); 
       
       //THEN WE APPEND ALL THE PROFILES ID'S TO A TEMPORARY CSV FILE. --> TROLMUT COMPATIBILITY
       appendTMPCSV(list.ids,csvPath);
       
      // NOW WE ADD THE PAGE DATA TO THE ZIP FILE
      filename = table + i;
      var content = ''; 
      for (x=0;x<list.ids.length;x++){ 
        content += list.ids[x]+'\n';
      }
      totalBlocks += x;
      zip.addFile(filename+".csv", Buffer.alloc(content.length, content), "@TrollBlockNet");
      // add local file
       
       //FINALLY WE RECURSIVELY CALL THE GET FUNCTION WE JUST DEFINED AVOBE SO WE CAN GET THE NEXT 
       //BATCH (CURSOR) IN A SYNCHRONIZED WAY (REQUEST ARE DONE SEQUENTIALLY) 
       if(list.next_cursor != 0) 
       {
         i++;
         params.cursor = list.next_cursor
         client.get('blocks/ids',params, getlist);
       }
       else
       {
         //IF IT's THE LAST BATCH, PACK IT ALL INTO A ZIP FILE
         // write everything to disk
         zip.writeZip("./public/"+table+".zip");
         
         //WE CREATE THE FINAL TROLMUT CSV FILE FOR EXPORT
         fs.renameSync(csvPath,newCsvPath);
         
         //AND FINALLY WE SAVE THE TOTALBLOCKS VAR IN THE FS TO BE USED BY /getTotals
         setTotalBlocks(totalBlocks,table);
       }
    }   
}); 
  
},
*/
  
    
// ---------------------------------------------------
// Function: 
// Description:
// Input: 
// Output: 
// ---------------------------------------------------
 
  
  /*var move = function (oldPath, newPath, callback) {

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });
}

// ---------------------------------------------------
// Function: 
// Description:
// Input: 
// Output: 
// ---------------------------------------------------

function copy() {
    var readStream = fs.createReadStream(oldPath);
    var writeStream = fs.createWriteStream(newPath);

    readStream.on('error', callback);
    writeStream.on('error', callback);

    readStream.on('close', function () {
        fs.unlink(oldPath, callback);
    });

    readStream.pipe(writeStream);
}*/
  
  
// ---------------------------------------------------
// Function: appendTMPCSV
// Description: Appends all id's in a csv file to allow TROLMUT.CAT compatibility
// Called by: retrieveTwitterBlocksAndUpdateDB2:
// Input: ids,csvPath
// Output: N/A
// ---------------------------------------------------

/* var appendTMPCSV = function (ids,csvPath){
  
  var wstream = fs.createWriteStream(csvPath, { 
    'flags': 'a'
    , 'mode' : 0777
    , 'encoding': null
  });
  let i;
  for (i=0;i<ids.length;i++)
  {
    wstream.write(ids[i]+'\n');
  }
  
  //wstream.write(ids+'');
  wstream.end();
}
*/
