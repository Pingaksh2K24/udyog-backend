import express from 'express';
import { getUserSettings, updateUserSettings } from '../controllers/settingsController.js';

const router = express.Router();

// Get user settings by user_id
router.get('/:userId', getUserSettings);

// Update user settings by user_id
router.put('/:userId', updateUserSettings);

export default router;