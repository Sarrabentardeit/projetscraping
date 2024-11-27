import express from 'express';
import scrapeRoutes from './routes/scrapeRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/scrape', scrapeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
