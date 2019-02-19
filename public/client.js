var reportRequest = new XMLHttpRequest(),
    method = "GET",
    url = "/getReports";

reportRequest.open(method, url, true);
reportRequest.onreadystatechange = function () {
  if(reportRequest.readyState == 4 && reportRequest.status == 200) {
    //reportRequest.onload = getreportsListener;
    
    ///////////////////////////
    ///   TABLE RENDERING   ///
    ///////////////////////////
    var  object = [];
    var  reports = JSON.parse(this.responseText);
     //Iterate through every report and add it to our page
 reports.forEach(function (row) {
   
    var UrlTweetID = "<a target=\"_blank\" href=https://www.twitter.com/userid/status/" + row.tweetID + ">" + row.tweetID + "</a>";
    var myObj = {tw_userID: row.tw_userID, tweetID: UrlTweetID, list: row.list, comments: row.comments};
    object.push(myObj);
   
  });
    
    //var  object = JSON.parse(this.responseText);


    function createTable(){
      $('#content').append('<table id="jsonTable"><thead><tr></tr></thead><tbody></tbody></table>');

      $.each(Object.keys(object[0]), function(index, key){
        if (key == "tw_userID"){
          $('#jsonTable thead tr').append('<th>ID USUARI</th>');
        }
        else if (key == "tweetID"){
        $('#jsonTable thead tr').append('<th>ID TWEET</th>');
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
             tableRow += '<td>' + jsonObject[key] + '</td>';
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
    
    console.log("JSON RESPONSE ->>>>>>>"+reportRequest.responseText);
  }
};
reportRequest.send();

///////////////////////////////////
///   THE END
//////////////////////////////////


///////////////////////////////////
///   NOTES
//////////////////////////////////

/* Asynchronous http requests are now enabled and all bugs are fixed in client.js since beta 1.8 */
 