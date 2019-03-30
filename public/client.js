

    ////////////////////////////////////////
    ///   TABLE RENDERING HTTP REQUEST  ///
    ///////////////////////////////////////

var reportRequest = new XMLHttpRequest(),
    method = "GET",
    url = "https://developer-trollblocknet.glitch.me/getReports";

reportRequest.open(method, url, true);
reportRequest.onreadystatechange = function () {
  if(reportRequest.readyState == 4 && reportRequest.status == 200) {
    //reportRequest.onload = getreportsListener;
    

    var  object = [];
    var  reports = JSON.parse(this.responseText);
     //Iterate through every report and add it to our page
 reports.forEach(function (row) {
   
    var UrlTweetID = "<a target=\"_blank\" href=https://www.twitter.com/userid/status/" + row.tweetID + ">" + row.tweetID + "</a>";
   var UrlTwitterProfile = "<a target=\"_blank\" href=https://www.twitter.com/" + row.screen_name + ">@" + row.screen_name + "</a>";
    var myObj = {tweetID: UrlTweetID, tw_userID: row.tw_userID, screen_name: UrlTwitterProfile, report_timestamp: row.report_timestamp, list: row.list, comments: row.comments};
    object.push(myObj);
   
  });
    
    //var  object = JSON.parse(this.responseText);


    function createTable(){
      $('#reportsContent').append('<table class="main-table" id="jsonTable"><thead><tr></tr></thead><tbody></tbody></table>');

      $.each(Object.keys(object[0]), function(index, key){
        if (key == "tw_userID"){
          $('#jsonTable thead tr').append('<th >ID USUARI</th>');
        }
        else if (key == "screen_name"){
        $('#jsonTable thead tr').append('<th>NOM USUARI</th>');
        }
        else if (key == "tweetID"){
        $('#jsonTable thead tr').append('<th class="fixed-side-header" scope="col">ID TWEET</th>');
        }
        else if (key == "report_timestamp"){
        $('#jsonTable thead tr').append('<th>DATA REPORT</th>');
        }
        else if (key == "list"){
        $('#jsonTable thead tr').append('<th>LLISTA</th>');
        }
        else if (key == "comments"){
        $('#jsonTable thead tr').append('<th>COMENTARIS</th>');
        }
      });	
      $.each(object, function(index, jsonObject){     
        if(Object.keys(jsonObject).length > 0){
          
            var tableRow = '<tr>';
          
          $.each(Object.keys(jsonObject), function(i, key){
            //console.log("KEY + TD -------------------->"+key+" , "+jsonObject[key]);
            
            //IF FIRST COLUMN SET STICKY CLASS
          var firstColumn = false;
          firstColumn = key == "tweetID";
          if (firstColumn){
            tableRow += '<td class="fixed-side" scope="col">';
          }
          //ELSE 
          else{
            tableRow += '<td>'; 
          }
             tableRow += jsonObject[key] + '</td>';
          });
          tableRow += "</tr>";
          $('#jsonTable tbody').append(tableRow);
        }
      });
    }

    $(document).ready(function(){
      createTable();
    });
    
    ///////////////////////////
    
    console.log("[tbc.client] : /getReports http Response code 200 - OK ->>>>>>> JSON DATA: "+reportRequest.responseText);
  }
};
reportRequest.send();

    ///////////////////////////7//////////////////////
    ///   LIST COUNTERS & TIMESTAMPS HTTP REQUEST  ///
    /////////////////////////////////////////////////

var totalsRequest = new XMLHttpRequest(),
    method = "GET",
    url = "https://developer-trollblocknet.glitch.me/getTotals";

totalsRequest.open(method, url, true);
totalsRequest.onreadystatechange = function () {
  if(totalsRequest.readyState == 4 && totalsRequest.status == 200) {
    //reportRequest.onload = getreportsListener;
    

     var  object2 = [];
     var  totals = JSON.parse(totalsRequest.responseText);
     //Iterate through every report and add it to our page
     totals.forEach(function (row2) {
      
        var myObj2 = {list: row2.list, total: row2.total, subscriptionLink: row2.subscriptionLink, csvLink: row2.csvLink };
        object2.push(myObj2);

      });

    function createTable2(){
      $('#totalsContent').append('<table id="jsonTable2"><thead><tr></tr></thead><tbody></tbody></table>');

      $.each(Object.keys(object2[0]), function(index, key){ 
        if (key == "list"){
          $('#jsonTable2 thead tr').append('<th>LLISTA</th>');
        }
        else if (key == "total"){
        $('#jsonTable2 thead tr').append('<th>TOTAL AFEGITS</th>');
        }
        else if (key == "subscriptionLink"){
        $('#jsonTable2 thead tr').append('<th>ENLLAÇ DE SUBSCRIPCIÓ AUTOMÀTICA</th>');
        }
        else if (key == "csvLink"){
        $('#jsonTable2 thead tr').append('<th>DESCÀRREGA D\'ARXIU CSV (SOLAMENT PC I MAC)</th>');
        }
      });	
      $.each(object2, function(index, jsonObject2){     
        if(Object.keys(jsonObject2).length > 0){
          var tableRow = '<tr>';
          $.each(Object.keys(jsonObject2), function(i, key){
             tableRow += '<td>' + jsonObject2[key] + '</td>';
          });
          tableRow += "</tr>";
          $('#jsonTable2 tbody').append(tableRow);
        }
      });
    }

    $(document).ready(function(){
      createTable2();
    });
    
    ///////////////////////////
    
    console.log("[tbc.client] : /getTotals http Response code 200 - OK ->>>>>>> JSON DATA: "+totalsRequest.responseText);
  }
};
totalsRequest.send();

////////////////////////////
/////// GET RECENTS ///////
//////////////////////////

var recentsRequest = new XMLHttpRequest(),
    method = "GET",
    url = "https://developer-trollblocknet.glitch.me/getRecents";

recentsRequest.open(method, url, true);
recentsRequest.onreadystatechange = function () {
  if(recentsRequest.readyState == 4 && recentsRequest.status == 200) {

     var  object3 = [];
     var  totals = JSON.parse(recentsRequest.responseText);
     //Iterate through every report and add it to our page
     totals.forEach(function (row3) {
      
        var UrlTwitterProfile = "<a target=\"_blank\" href=https://www.twitter.com/" + row3.screen_name + ">@" + row3.screen_name + "</a>";
        var myObj3 = { screen_name: UrlTwitterProfile, list : row3.list, report_timestamp: row3.report_timestamp };
        object3.push(myObj3);

      });

    function createTable3(){
      $('#recentsContent').append('<table id="jsonTable3"><thead><tr></tr></thead><tbody></tbody></table>');

      $.each(Object.keys(object3[0]), function(index, key){ 
        if (key == "screen_name"){
          $('#jsonTable3 thead tr').append('<th>NOM USUARI</th>');
        }
        else if (key == "list"){
        $('#jsonTable3 thead tr').append('<th>LLISTA</th>');
        }
        else if (key == "report_timestamp"){
        $('#jsonTable3 thead tr').append('<th>DATA REPORT</th>');
        }
      });	
      $.each(object3, function(index, jsonObject3){     
        if(Object.keys(jsonObject3).length > 0){
          var tableRow = '<tr>';
          $.each(Object.keys(jsonObject3), function(i, key){
             tableRow += '<td>' + jsonObject3[key] + '</td>';
          });
          tableRow += "</tr>";
          $('#jsonTable3 tbody').append(tableRow);
        }
      });
    }

    $(document).ready(function(){
      createTable3();
    });
    
    console.log("[tbc.client] : /getRecents http Response code 200 - OK ->>>>>>> JSON DATA: "+recentsRequest.responseText);
  }
};
recentsRequest.send();

 ///////////////////////////



///////////////////////////////////
///   THE END
//////////////////////////////////


///////////////////////////////////
///   NOTES
//////////////////////////////////

/* Asynchronous http requests are now enabled and all bugs are fixed in client.js since beta 1.8 */
 
