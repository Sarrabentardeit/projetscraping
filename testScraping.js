const scrapeGoogleMaps = require('./src/modules/googleMapsScraper');

scrapeGoogleMaps("restaurants in Paris")
  .then(results => {
    console.log("Scraping completed successfully.");
    console.table(results);
  })
  .catch(error => {
    console.error("An error occurred during scraping:", error);
  });
