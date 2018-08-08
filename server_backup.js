// Require our dependencies
var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var request = require("request");
var logger = require("morgan");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// models route
var db = require("./models");

// Set up our port to be either the host's designated port, or 3000
var PORT = process.env.PORT || 3000;

// Instantiate our Express App
var app = express();

// Designate our public folder as a static directory
app.use(express.static("public"));

// Connect Handlebars to our Express app
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use bodyParser in our app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use morgan logger for logging requests
app.use(logger("dev"));

// If deployed, use the deployed database. Otherwise use the local newsScrape database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScrape";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// Routes

// A GET route for scraping the nytimes website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article.story").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      result.byline = $(this)
        .children("p.byline")
        .text();
      result.datetime = $(this)
        .children("time.timestamp")
        .attr("datetime");
      result.dataEasternTimestamp = $(this)
        .children("time.timestamp")
        .attr("data-eastern-timestamp");
      result.dataUTCTimestamp = $(this)
        .children("time.timestamp")
        .attr("data-utc-timestamp");
      result.summary = $(this)
        .children("p.summary")
        .text();

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// GET all the movies that favorite is set to false
// and render them to the index.handlebars page
app.get("/", function(req, res) {
  db.Movie.find({ favorite: false })
    .then(function(data) {
      // res.json(data);
      res.render("index", { movie: data });
    })
    .catch(function(err) {
      res.status(404).send(err);
    });
});

// GET all the movies that favorite is set to true
// and render them to the favorite.handlebars page
app.get("/favorites", function(req, res) {
  db.Movie.find({ favorite: true })
    .then(function(data) {
      // res.json(data);
      res.render("favorite", { movie: data });
    })
    .catch(function(err) {
      res.status(404).send(err);
    });
});

// POST a new movie to the mongo database
app.post("/api/movie", function(req, res) {
  db.Movie.create(req.body)
    .then(function() {
      // res.json(dbMovie);
      res.redirect("/");
    })
    .catch(function(err) {
      res.status(400).send(err);
    });
});

// PUT (UPDATE) a movie by its _id
// Will set the movie favorite to whatever the value
// of the req.body.favorite boolean is
app.put("/api/movie/:id", function(req, res) {
  db.Movie.findByIdAndUpdate(
    req.params.id,
    { favorite: req.body.favorite },
    { new: true }
  )
    .then(function(dbMovie) {
      res.json(dbMovie);
    })
    .catch(function(err) {
      res.status(400).send(err);
    });
});

// Listen on the port
app.listen(PORT, function() {
  console.log("Listening on port: " + PORT);
});
