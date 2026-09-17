import express from 'express';
import { planChain, executeChain } from '../controllers/agent.controller.js';

const router = express.Router();

router.post('/plan', planChain);
router.post('/execute', executeChain);

export default router;
