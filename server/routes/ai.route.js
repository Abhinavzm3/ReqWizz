import express from 'express';
import { generateRequest, debugError, generateTypes, generateDocs, analyzeResponse } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/generate-request', generateRequest);
router.post('/debug-error', debugError);
router.post('/generate-types', generateTypes);
router.post('/generate-docs', generateDocs);
router.post('/analyze-response', analyzeResponse);

export default router;