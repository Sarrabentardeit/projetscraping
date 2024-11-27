// Importer les bibliothèques nécessaires avec `import`
import fs from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Utiliser le plugin stealth pour éviter la détection
puppeteer.use(StealthPlugin());

async function scrapeListGoogleMaps() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Accéder à Google Maps
  await page.goto("https://www.google.com/maps", { waitUntil: "networkidle2" });
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("Veuillez entrer votre mot de recherche dans la barre de recherche de Google Maps et appuyez sur Entrée.");

  // Attendre que les résultats se chargent
  await page.waitForSelector('div[role="feed"]', { timeout: 0 });

  // Scroller pour charger tous les résultats
  await page.evaluate(async () => {
    const wrapper = document.querySelector('div[role="feed"]');
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
          sameHeightCount++;
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

  // Extraire les liens de chaque lieu
  const results = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="feed"] > div'));
    return items.map(item => {
      const title = item.querySelector('.fontHeadlineSmall')?.innerText || "N/A";
      const link = item.querySelector('a')?.href || "N/A";
      return { title, link };
    });
  });

  // Filtrer et extraire les détails
  const filteredResults = results.filter(result => result.link !== "N/A");
  let detailedResults = [];

  for (const result of filteredResults) {
    const detailPage = await browser.newPage();
    try {
      await detailPage.goto(result.link, { waitUntil: "networkidle2" });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extraire les informations de la page de détail
      const detail = await detailPage.evaluate(() => {
        const title = document.querySelector("h1[class^='DUwDvf'], h1[class*='x3AX1']")?.innerText || "Non disponible";
        const rating = document.querySelector("span.F7nice, span[aria-label*='étoiles']")?.textContent || "Non disponible";
        const reviews = document.querySelector("button[aria-label*='avis'], span[aria-label*='avis']")?.textContent || "Non disponible";
        const address = document.querySelector("button[data-item-id='address'], div[aria-label='Adresse']")?.innerText || "Non disponible";
        let phone = document.querySelector("button[data-tooltip='Copier le numéro de téléphone'], span[aria-label*='Téléphone']")?.innerText || "Non disponible";
        const website = document.querySelector("a[data-tooltip='Ouvrir le site Web'], a[href*='http']")?.href || "Non disponible";

        // Si le numéro de téléphone est "Non disponible", utiliser une expression régulière pour l'extraire du texte de la page
        if (phone === "Non disponible") {
          const pageText = document.body.innerText;
          const phonePattern = /(?:\+?\d{1,3})?\s?(?:\(?\d{2,4}\)?\s?)?\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4}/g;
          const phoneMatch = pageText.match(phonePattern);
          if (phoneMatch) {
            phone = phoneMatch[0]; // Prendre le premier numéro trouvé
          }
        }

        return { title, rating, reviews, address, phone, website };
      });

      console.log("Détails pour :", result.title);
      console.table([detail]);

      detailedResults.push(detail);
    } catch (error) {
      console.error("Erreur pour :", result.title, error);
    } finally {
      await detailPage.close();
    }
  }

  // Sauvegarder les résultats dans un fichier JSON
  fs.writeFileSync("results_detailed.json", JSON.stringify(detailedResults, null, 2));
  console.log("Les détails des lieux ont été sauvegardés dans results_detailed.json");

  await browser.close();
}

// Exécuter le script
scrapeListGoogleMaps().catch(console.error);
