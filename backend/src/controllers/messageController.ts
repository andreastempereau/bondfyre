import { Request, Response } from 'express';
import { Message, Match } from '../models';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { matchId } = req.params;
    
    // Check if match exists and user is part of it
    const match = await Match.findById(matchId);
    
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }
    
    if (match.user.toString() !== req.user._id.toString() && 
        match.matchedUser.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view messages for this match' });
      return;
    }
    
    // Get all messages for this match
    const messages = await Message.find({ match: matchId })
      .populate('sender', 'name photos')
      .populate('receiver', 'name photos')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { matchId } = req.params;
    const { content } = req.body;
    
    // Check if match exists and user is part of it
    const match = await Match.findById(matchId);
    
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }
    
    if (match.user.toString() !== req.user._id.toString() && 
        match.matchedUser.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to send messages for this match' });
      return;
    }
    
    // Determine receiver
    const receiverId = match.user.toString() === req.user._id.toString() 
      ? match.matchedUser 
      : match.user;
    
    // Create new message
    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      match: matchId
    });
    
    await message.save();
    
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markMessagesAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { matchId } = req.params;
    
    // Check if match exists and user is part of it
    const match = await Match.findById(matchId);
    
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }
    
    if (match.user.toString() !== req.user._id.toString() && 
        match.matchedUser.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update messages for this match' });
      return;
    }
    
    // Mark all unread messages as read
    await Message.updateMany(
      { 
        match: matchId, 
        receiver: req.user._id,
        read: false
      },
      { read: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 