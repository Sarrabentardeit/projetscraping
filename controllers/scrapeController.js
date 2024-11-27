import { scrapeListGoogleMaps } from '../scripts/scrapeGoogleMaps.js';
import { scrapeMultipleContacts } from '../scripts/scrapeContactInfo.js';

export const scrapeGoogleMaps = async (req, res) => {
  try {
    await scrapeListGoogleMaps();
    res.status(200).json({ message: "Scraping de Google Maps terminé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du scraping de Google Maps", error });
  }
};

export const scrapeContacts = async (req, res) => {
  const urls = req.body.urls;
  if (!urls || urls.length === 0) {
    return res.status(400).json({ message: "Veuillez fournir une liste d'URLs." });
  }

  try {
    const data = await scrapeMultipleContacts(urls);
    res.status(200).json({ message: "Scraping des informations de contact terminé avec succès.", data });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du scraping des informations de contact", error });
  }
};
