import puppeteer from 'puppeteer';
import { createObjectCsvWriter as csvWriter } from 'csv-writer';

const csv = csvWriter({
  path: 'data/output.csv',
  header: [
    { id: 'url', title: 'URL' },
    { id: 'email', title: 'Email' },
    { id: 'phone', title: 'Phone' },
    { id: 'facebook', title: 'Facebook' },
    { id: 'instagram', title: 'Instagram' },
    { id: 'linkedin', title: 'LinkedIn' }
  ]
});

async function scrapeContactInfo(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  const content = await page.content();

  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phonePattern = /\+?[0-9]{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}/g;
  const facebookPattern = /https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9._-]+/g;
  const instagramPattern = /https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+/g;
  const linkedinPattern = /https?:\/\/(www\.)?linkedin\.com\/[a-zA-Z0-9._-]+/g;

  const emails = content.match(emailPattern) || [];
  const phones = content.match(phonePattern) || [];
  const facebookLinks = content.match(facebookPattern) || [];
  const instagramLinks = content.match(instagramPattern) || [];
  const linkedinLinks = content.match(linkedinPattern) || [];

  await browser.close();

  return {
    url,
    email: emails.length > 0 ? emails[0] : "Non disponible",
    phone: phones.length > 0 ? phones[0] : "Non disponible",
    facebook: facebookLinks.length > 0 ? facebookLinks[0] : "Non disponible",
    instagram: instagramLinks.length > 0 ? instagramLinks[0] : "Non disponible",
    linkedin: linkedinLinks.length > 0 ? linkedinLinks[0] : "Non disponible"
  };
}

export async function scrapeMultipleContacts(urls) {
  const data = [];
  for (const url of urls) {
    console.log(`Scraping ${url}...`);
    const contactInfo = await scrapeContactInfo(url);
    data.push(contactInfo);
  }

  await csv.writeRecords(data);
  console.log("Les informations de contact ont été enregistrées dans output.csv");

  return data;  // Retourne les données pour l'API
}
