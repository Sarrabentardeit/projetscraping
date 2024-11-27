import express from 'express';
import { scrapeGoogleMaps, scrapeContacts } from '../controllers/scrapeController.js';

const router = express.Router();

router.get('/google-maps', scrapeGoogleMaps);
router.post('/contacts', scrapeContacts);

export default router;
