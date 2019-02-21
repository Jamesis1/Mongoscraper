var cheerio = require("cheerio");
var express = require("express");
// Makes HTTP request for HTML page
var axios = require("axios");
var mongojs = require("mongojs");
// Database configuration
var app = express();

var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console, log("Database Error:", error);
});

// var MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// // mongoose.connect(MONGODB_URI);

// Route
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
  res.send("Scrape Complete");
});

// // Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

// // axios.get("https://www.nytimes.com/").then(function(response) {
// //   // Load the Response into cheerio and save it to a variable
// //   // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
// //   var $ = cheerio.load(response.data);

// //   // An empty array to save the data that we'll scrape
// //   var results = [];
// //   //   console.log(response.data);
// //   // With cheerio, find each p-tag with the "title" class
// //   // (i: iterator. element: the current element)
// //   $("article.css-8atqhb").each(function(i, element) {
// //     // Save the text of the element in a "title" variable
// //     // var title = $(element).text();
// //     // console.log($(element));
// //     //     // In the currently selected element, look at its child elements (i.e., its a-tags),
// //     //     // then save the values for any "href" attributes that the child elements may have
// //     var link = $(element)
// //       .children()
// //       .attr("href");
// //     console.log(link);

// //     //     // Save these results in an object that we'll push into the results array we defined earlier
// //     //     results.push({
// //     //       title: title,
// //     //       link: link
// //     //     });
// //   });

// //   //   // Log the results once you've looped through each of the elements found with cheerio
// //   //   console.log(results);
// // });
