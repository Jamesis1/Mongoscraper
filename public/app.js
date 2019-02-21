function displayResults(scrapedData) {
  animals.forEach(function(animal) {});
}

$.getJSON("/all", function(data) {
  // Call our function to generate a table body
  displayResults(data);
});
