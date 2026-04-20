import express from 'express';
import {
    analyzeTherapySession,
    getTherapySessions,
    getTherapySessionById,
    getTherapySessionSummary
} from '../controllers/therapyController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.use(auth);
router.post('/analyze', analyzeTherapySession);
router.get('/sessions', getTherapySessions);
router.get('/sessions/:id', getTherapySessionById);
router.get('/sessions/:id/summary', getTherapySessionSummary);

export default router;
