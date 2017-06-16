$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link.replace(/'|"/g, "") + "</p>");
    //the onion returns data.link with quotes around the main site WHY WOULD THEY DO THAT!
    console.log(data[i].link.replace(/'|"/g, ""));
  }
});

$(document).on("click", "p", function() {
  $("#comments").empty();
  var thisId = $(this).attr("data-id");


  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      $("#comments").append("<h2>" + data.title + "</h2>");
      $("#comments").append("<input id='titleinput' name='title' >");
      $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");


      if (data.comment) {
        $("#titleinput").val(data.comment.title);
        $("#bodyinput").val(data.comment.body);
      }
    });
});

$("#savecomment").on("click", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      commentTitle: $("#titleinput").val(),
      CommentBody: $("#bodyinput").val()
    }
  })
    .done(function(data) {
      console.log(data);
      $("#comments").empty();
    });
  $("#titleinput").val("");
  $("#bodyinput").val("");
});