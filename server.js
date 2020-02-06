var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/news-scraper1", { useNewUrlParser: true });


app.get("/scrape", function(req, res) {
    axios.get("https://www.skimag.com/news").then(function(response){
        var $ = cheerio.load(response.data);

        $("article a").each(function(i, element) {
            var result = {};

            result.title = $(this).children("h2").text();
            result.link = $(this).attr("href");

            db.Article.create(result).then(function(dbArticle) {
                console.log(dbArticle);
            }).catch(function(err) {
                console.log(err);  
            });
        });
        res.send("Scrape Complete");
        
    });
});

app.get("/", function(req, res) {
    db.Article.find({}).then(function(dbArticle) {
      console.log(dbArticle);
      const hbsObj = {
        articles: dbArticle
      }
      res.render("index", hbsObj);
    }).catch(function(err) {
        res.json(err);
      });
  });

app.get("/articles", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  app.post("/articles/:id", function(req, res) {
    
    db.Note.create(req.body)
      .then(function(dbNote) {
        console.log("dbNote", dbNote);
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    console.log("req", req);
    
    db.Note.findByIdAndDelete(id)
      .then(function(dbNote) {
        res.json(dbNote)
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  
  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  