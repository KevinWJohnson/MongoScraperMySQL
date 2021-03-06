$(document).ready(function() {
  // Whenever someone clicks a Article Notes button
  $(document).on("click", ".article-notes", function() {
    //console.log("Article Notes Button Click Works");
    window.scrollTo(0, 0);
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the button which got it from the article id
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function(dataArray) {
        // Sequelize returns an array of objects
        var data = dataArray[0];
        //console.log("Article data: " + JSON.stringify(dataArray));
        //console.log("Article data object: " + JSON.stringify(data));
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' placeholder='Enter Title of Note'>");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Enter Note Here'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append(
          "<button data-id='" + data.id + "' id='savenote'>Save Note</button>"
        );


        
        // If there's a noteID in the article
        if (data.noteID) {

          // Now make an ajax call for the Note
          $.ajax({
            method: "GET",
            url: "/notes/" + data.noteID
          })
          // With that done, add the note information to the page
          .then(function(dataNotesArray) {
            // Sequelize returns an array of objects
            var dataNotes = dataNotesArray[0];
            //console.log("Note data: " + JSON.stringify(dataNotesArray));
            //console.log("Note data object: " + JSON.stringify(dataNotes));

            // Place the title of the note in the title input
            $("#titleinput").val(dataNotes.title);
            // Place the body of the note in the body textarea
            $("#bodyinput").val(dataNotes.body);
          })
        }
      });
  });

  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        //console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });

    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });

  //************************************************ */
  $(".article-favorite").on("click", function(e) {
    var ArticleId = $(this).attr("data-id");
    $.ajax({
      url: "/articles/" + ArticleId,
      method: "PUT",
      data: {
        favorite: true
      }
    })
      .then(function(data) {
        if (data) {
          window.location.href = "/favorites";
        }
      })
      .catch(function(err) {
        alert(err);
      });
  });

  $(".article-unfavorite").on("click", function(e) {
    var ArticleId = $(this).attr("data-id");
    $.ajax({
      url: "/articles/" + ArticleId,
      method: "PUT",
      data: {
        favorite: false
      }
    })
      .then(function(data) {
        if (data) {
          window.location.href = "/favorites";
        }
      })
      .catch(function(err) {
        alert(err);
      });
  });


  //************************************************ */
  $(".article-delete").on("click", function(e) {
    var ArticleId = $(this).attr("data-id");
    $.ajax({
      method: "POST",
      url: "/articlesRemove/" + ArticleId,
      data: {id: ArticleId}
    })
      .then(function(data) {
        location.reload();
      })
      .catch(function(err) {
        alert(err);
      });
  });
});
