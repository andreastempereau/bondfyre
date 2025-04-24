import { Request, Response } from 'express';
import { User } from '../models';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { name, bio, interests, photos } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (interests) user.interests = interests;
    if (photos) user.photos = photos;
    
    await user.save();
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      bio: user.bio,
      interests: user.interests,
      photos: user.photos,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 