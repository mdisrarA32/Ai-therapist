import express from 'express';
import Dashboard from '../models/Dashboard';
import { getIO } from '../socket';
import mongoose from 'mongoose';

const router = express.Router();

// Helper to convert "default-user" to a valid ObjectId to prevent CastError crashes
const getValidUserId = (val: string) => {
  if (mongoose.Types.ObjectId.isValid(val)) return new mongoose.Types.ObjectId(val);
  return new mongoose.Types.ObjectId('000000000000000000000000');
};

const emitUpdate = (dashboard: any) => {
  try {
    const io = getIO();
    io.emit('dashboardUpdated', dashboard);
  } catch (err) {
    console.error("Socket emit failed", err);
  }
};

// GET Dashboard
router.get('/:userId', async (req, res) => {
  try {
    const validUserId = getValidUserId(req.params.userId);
    let dashboard = await Dashboard.findOne({ userId: validUserId });
    if (!dashboard) {
      // Create initial if missing
      dashboard = new Dashboard({ userId: validUserId });
      await dashboard.save();
    }
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to find dashboard' });
  }
});

// POST update mood
router.post('/mood', async (req, res) => {
  const { userId, moodValue } = req.body;
  if (!userId || moodValue === undefined) return res.status(400).json({ error: 'Missing logic fields.' });
  
  try {
    const validUserId = getValidUserId(userId);
    let dashboard = await Dashboard.findOne({ userId: validUserId });
    if (!dashboard) dashboard = new Dashboard({ userId: validUserId });
    
    dashboard.moodScore = Number(moodValue);
    dashboard.moodHistory.push({ value: Number(moodValue), date: new Date() });
    dashboard.lastUpdated = new Date();
    await dashboard.save();

    emitUpdate(dashboard);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update mood' });
  }
});

// POST activity
router.post('/activity', async (req, res) => {
  const { userId } = req.body;
  try {
    const validUserId = getValidUserId(userId);
    let dashboard = await Dashboard.findOne({ userId: validUserId });
    if (!dashboard) dashboard = new Dashboard({ userId: validUserId });

    dashboard.totalActivities += 1;
    dashboard.lastUpdated = new Date();
    await dashboard.save();

    emitUpdate(dashboard);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// POST therapy session
router.post('/session', async (req, res) => {
  const { userId } = req.body;
  try {
    const validUserId = getValidUserId(userId);
    let dashboard = await Dashboard.findOne({ userId: validUserId });
    if (!dashboard) dashboard = new Dashboard({ userId: validUserId });

    dashboard.therapySessions += 1;
    dashboard.lastUpdated = new Date();
    await dashboard.save();

    emitUpdate(dashboard);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

export default router;
