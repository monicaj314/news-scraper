var express = require("express");
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose")
var bodyParser = require("body-parser");
var Comment = require("./models/comments.js");
var Article = require("./models/articles.js");

mongoose.Promise = Promise;

var app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: false
}));

mongoose.connect("mongodb://localhost/scraper_db");
var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});

app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.send(doc);
    }
  });
});

app.get("/scrape", function(req, res) {
  request("http://www.theonion.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("h2.headline").each(function(i, element) {
        var result = {};
        result.title = $(this).children("a").attr("title");
        result.link = "<a href= http://www.theonion.com" + $(this).children("a").attr("href") + ">Go to article</a>";
        result.comment = [];
        // result.thumbnail = "<img src='" +  + "'/>";

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });

  res.send("Scrape Complete");
});

app.get("/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("comment")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});


app.post("/articles/:id", function(req, res) {
  var newComment = new Comment(req.body);

  newComment.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "comment": doc._id })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    }
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

