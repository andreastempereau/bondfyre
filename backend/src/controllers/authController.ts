import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with profile information
    const user = new User({
      email,
      password: hashedPassword,
      name,
      bio: profile?.bio || '',
      age: profile?.age,
      gender: profile?.gender,
      interests: profile?.interests || [],
      photos: profile?.photos || []
    });

    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        age: user.age,
        gender: user.gender,
        interests: user.interests,
        photos: user.photos
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found');
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    console.log('Stored password hash:', user.password);
    console.log('Provided password:', password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch');
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    console.log('Login successful, token generated');

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        age: user.age,
        gender: user.gender,
        interests: user.interests,
        photos: user.photos
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    console.log('Resetting password for email:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log('New password hash:', hashedPassword);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: error.message });
  }
}; 