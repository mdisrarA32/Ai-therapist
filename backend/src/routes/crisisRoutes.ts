import express from 'express';
import { sendEmergencyAlert } from '../services/EmergencyAlertService';
import { User } from '../models/User';

const router = express.Router();

// Called by frontend when crisis popup appears
router.post('/alert', async (req, res) => {
  try {
    const { userId, userName, detectedLanguage } = req.body;

    // Get user's emergency contact from database
    const user = await User.findById(userId);
    
    if (!user?.emergencyContact?.phone) {
      return res.json({ 
        success: false, 
        message: 'No emergency contact found' 
      });
    }

    const sent = await sendEmergencyAlert(
      user.emergencyContact as { name: string; phone: string; },
      userName || 'A user',
      detectedLanguage || 'en'
    );

    return res.json({ success: sent });

  } catch (error) {
    console.error('Crisis alert error:', error);
    return res.status(500).json({ success: false });
  }
});

export default router;
