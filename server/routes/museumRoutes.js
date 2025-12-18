import express from 'express';
import { getMuseums, getMuseum } from '../controllers/museumController.js';

const router = express.Router();

router.get('/', getMuseums);
router.get('/:id', getMuseum);

export default router;


