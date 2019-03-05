var cheerio = require("cheerio");
var express = require("express");
// Makes HTTP request for HTML page
var axios = require("axios");
var mongojs = require("mongojs");

var PORT = process.env.PORT || 3000;
// Database configuration
var app = express();

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var databaseUrl = process.env.MONGODB_URI || "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// var MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// // mongoose.connect(MONGODB_URI);

// Route
app.get("/", function(req, res) {
  db.scrapedData.find({}, function(error, found) {
    if (error) {
      console.log(error);
    } else {
      console.log(found);
      res.render("index");
    }
  });
});
app.get("/all", function(req, res) {
  db.scrapedData.find({}, function(error, found) {
    if (error) {
      console.log(error);
    } else {
      res.json(found);
    }
  });
});

// When you visit this route, the server will
// scrape data from the site of your choice, and save it to
// MongoDB.
app.get("/scrape", function(req, res) {
  axios.get("https://www.nytimes.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    console.log($("h2.css-6h3ud0.esl82me2").text());

    $("article.css-8atqhb").each(function(i, element) {
      // Save the text of the element in a "title" variable
      var title = $(element)
        .find("h2")
        .text();
      console.log("+++++++++++++++++++++++++++++++++++++++++++");
      console.log(title);
      // In the currently selected element, look at its child elements (i.e., its a-tags),
      // then save the values for any "href" attributes that the child elements may have
      var link = $(element)
        .find("a")
        .attr("href");
      link = "https://www.nytimes.com" + link;

      db.scrapedData.insert(
        {
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          } else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        }
      );
    });
  });
  res.render("Scrape");
});

// // Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
