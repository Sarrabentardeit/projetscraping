// services/scrapeDetail.js
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function scrapeDetail() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.google.com/maps", { waitUntil: "networkidle2" });
    console.log("Veuillez entrer votre adresse ou lieu exact dans la barre de recherche de Google Maps et appuyer sur Entrée.");

    await new Promise(resolve => setTimeout(resolve, 10000));

    const result = await page.evaluate(() => {
      const title = document.querySelector("h1[class^='DUwDvf'], h1[class*='x3AX1']")?.textContent.trim() || "Non disponible";
      const rating = document.querySelector("span.F7nice, span[aria-label*='étoiles']")?.textContent.trim() || "Non disponible";
      const reviews = document.querySelector("button[aria-label*='avis'], span[aria-label*='avis']")?.textContent.replace("(", "").replace(")", "").trim() || "Non disponible";
      const address = document.querySelector("button[data-item-id='address'], div[aria-label='Adresse']")?.textContent.trim() || "Non disponible";

      const phonePattern = /(?:\+?\d{1,3})?\s?(?:\(?\d{2,4}\)?\s?)?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}/g;
      let phone = "Non disponible";

      const elements = document.querySelectorAll("span, div, button");
      elements.forEach((el) => {
        const text = el.textContent.trim();
        const match = text.match(phonePattern);
        if (match && match[0].length >= 8 && match[0].length <= 15) {
          phone = match[0];
        }
      });

      const website = document.querySelector("a[data-tooltip='Ouvrir le site Web'], a[href*='http']")?.getAttribute("href") || "Non disponible";

      return { title, rating, reviews, address, phone, website };
    });

    console.log("Détails du lieu recherché :");
    console.table([result]);
  } catch (error) {
    console.error("Erreur lors du scraping :", error);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeDetail };
