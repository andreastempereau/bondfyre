import express from 'express';
import { auth } from '../middleware/auth';
import { updateProfile, getProfile } from '../controllers';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

export default router; 