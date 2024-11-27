// services/scrapeList.js
const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function scrapeList() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.google.com/maps");

  console.log("Veuillez entrer votre mot de recherche dans la barre de recherche de Google Maps et appuyez sur Entrée.");

  await page.waitForSelector('div[role="feed"]', { timeout: 0 });

  await page.evaluate(async () => {
    const searchResultsSelector = 'div[role="feed"]';
    const wrapper = document.querySelector(searchResultsSelector);

    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 1000;
      const scrollDelay = 1000;
      let previousHeight = 0;
      let sameHeightCount = 0;

      const timer = setInterval(() => {
        wrapper.scrollBy(0, distance);
        totalHeight += distance;

        if (previousHeight === wrapper.scrollHeight) {
          sameHeightCount += 1;
        } else {
          sameHeightCount = 0;
        }
        previousHeight = wrapper.scrollHeight;

        if (sameHeightCount >= 3) {
          clearInterval(timer);
          resolve();
        }
      }, scrollDelay);
    });
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  const results = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="feed"] > div'));
    return items.map(item => {
      const title = item.querySelector('.fontHeadlineSmall')?.innerText || "N/A";
      const link = item.querySelector('a')?.href || "N/A";
      const ratingElement = item.querySelector('span[role="img"]');
      const stars = ratingElement ? parseFloat(ratingElement.getAttribute('aria-label').split(" ")[0]) : "N/A";
      const reviewsElement = item.querySelector('span[role="img"]');
      const reviews = reviewsElement ? reviewsElement.getAttribute('aria-label').split(" ")[3] : "N/A";
      const phone = item.querySelector('.section-result-phone-number')?.innerText || "N/A";
      return { title, link, stars, reviews, phone };
    });
  });

  const filteredResults = results.filter((result) => result.title !== "N/A");

  fs.writeFileSync("data/results.json", JSON.stringify(filteredResults, null, 2));

  console.table(filteredResults);
  console.log("Completed");

  await browser.close();
}

module.exports = { scrapeList };
