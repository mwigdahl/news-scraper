  
  $(document).on("click", ".make-note", function() {
    $("#notes").empty();
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      .then(function(data) {
        $("#notes").append("<h2>" + data.title + "</h2>");
        $("#notes").append("<input id='titleinput' name='title' >");
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        $("#notes").append("<button data-id='" + data._id + "' id='savenote' data-dismiss='modal'>Save Note</button>");
        $("#notes").append("<a data-id='" + data.note._id + "' class='delete-note' data-dismiss='modal'>Delete Note</a>");
  
        if (data.note) {
          $("#titleinput").val(data.note.title);
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  
  $(document).on("click", "#savenote", function() {
    var thisId = $(this).attr("data-id");

    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
        body: $("#bodyinput").val()
      }
    })
      .then(function(data) {
        $("#notes").empty();
      });
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });

  $(document).on("click", ".delete-note", function() {
    const thisId = $(this).attr("data-id");
    
    $.ajax({
      method: "GET",
      url: "/delete/" + thisId
    });
  });
  