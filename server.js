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

// Routes

// Route for Homepage
app.get('/', function (req, res) {
  res.render('home');
});


// A GET route for scraping the nytimes website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/section/world").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    
    // Now, we grab every story-body class within the div, and do the following:
    $("article").each(function(i, element) {
      var result = {};
      result.title = $(element)
        .children("div")
        .children("h2")
        .children("a")
        .text();
      result.link = $(element)
        .children("div")
        .children("h2")
        .children("a")
        .attr("href");
      result.summary = $(element)
        .children("div")
        .children("p")
        .html();
      result.byline = $(element)
        .children("div")
        .children("p")
        .children("span")
        .text();
        //console.log("Article Result:");
        //console.log(result);
      // Create a new Article using the `result` object built from scraping
      db.article.create(result)
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

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.article.findAll()
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, render them on the index page
      // res.json(dbArticle);
      res.render("index", {article: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// GET all the articles that favorite is set to true
// and render them to the favorite.handlebars page
app.get("/favorites", function(req, res) {
  db.article.findAll({
                where: {
                  favorite: true
                }
    })
    .then(function(ArticleFav){
      // res.json(data);
      res.render("favorite", {article: ArticleFav});
    }).catch(function(err){
      res.status(404).send(err);
    });
});



// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.article.findAll({
                  where: {
                    id: req.params.id
                  }
    })
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/notes/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.note.findAll({
                  where: {
                    id: req.params.id
                  }
    })
    .then(function(dbNote) {
      // If we were able to successfully find an Note with the given id, send it back to the client
      res.json(dbNote);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `id` equal to `req.params.id`. 
      // Update the Article to be associated with the new Note
     
      return (db.article.update({ noteID: dbNote.id }, {
        where: {
          id: req.params.id
        }
      }));
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// PUT (UPDATE) a article by its id 
// Will set the article favorite to whatever the value 
// of the req.body.favorite boolean is

app.put("/articles/:id", function(req, res){

  db.article.update({favorite: req.body.favorite}, {
    where: {
      id: req.params.id
    }
  })
    .then(function(dbArticle){

      res.json(dbArticle);

    }).catch(function(err){

      res.status(400).send(err);

    });

});



// Listen on the port
db.sequelize.sync().then(function() {
  app.listen(PORT, function() {
    console.log("Listening on port: " + PORT);
  });
});
