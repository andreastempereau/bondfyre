import { Request, Response } from 'express';
import { Match } from '../models';

export const getMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    // Find all matches for the user
    const matches = await Match.find({
      $or: [
        { user: req.user._id },
        { matchedUser: req.user._id }
      ],
      status: 'accepted'
    })
    .populate('user', 'name age gender photos')
    .populate('matchedUser', 'name age gender photos')
    .populate('userGroup', 'name bio photos')
    .populate('matchedGroup', 'name bio photos')
    .sort({ createdAt: -1 });
    
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { matchedUserId, userGroupId, matchedGroupId, matchType } = req.body;
    
    // Check if match already exists
    const existingMatch = await Match.findOne({
      $or: [
        { user: req.user._id, matchedUser: matchedUserId },
        { user: matchedUserId, matchedUser: req.user._id }
      ]
    });
    
    if (existingMatch) {
      res.status(400).json({ message: 'Match already exists' });
      return;
    }
    
    // Create new match
    const match = new Match({
      user: req.user._id,
      matchedUser: matchedUserId,
      userGroup: userGroupId,
      matchedGroup: matchedGroupId,
      matchType,
      status: 'pending'
    });
    
    await match.save();
    
    res.status(201).json(match);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMatchStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const match = await Match.findById(id);
    
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }
    
    // Check if user is part of the match
    if (match.user.toString() !== req.user._id.toString() && 
        match.matchedUser.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this match' });
      return;
    }
    
    match.status = status;
    await match.save();
    
    res.json(match);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { id } = req.params;
    
    const match = await Match.findById(id)
      .populate('user', 'name age gender photos')
      .populate('matchedUser', 'name age gender photos')
      .populate('userGroup', 'name bio photos')
      .populate('matchedGroup', 'name bio photos');
    
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }
    
    // Check if user is part of the match
    if (match.user._id.toString() !== req.user._id.toString() && 
        match.matchedUser._id.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this match' });
      return;
    }
    
    res.json(match);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 