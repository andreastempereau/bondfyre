import { Request, Response } from 'express';
import { Group } from '../models';
import crypto from 'crypto';

const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { name, bio, interests, photos, members } = req.body;
    
    // Generate a unique invite code
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existingGroup = await Group.findOne({ inviteCode });
      if (!existingGroup) {
        isUnique = true;
      }
    }
    
    // Create new group
    const group = new Group({
      name,
      bio: bio || '',
      interests: interests || [],
      photos: photos || [],
      members: [...members, req.user._id],
      createdBy: req.user._id,
      inviteCode
    });
    
    await group.save();
    
    res.status(201).json(group);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    // Find groups where the user is a member
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name age gender photos')
      .sort({ createdAt: -1 });
    
    res.json(groups);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { id } = req.params;
    
    const group = await Group.findById(id)
      .populate('members', 'name age gender photos');
    
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Check if user is a member of the group
    if (!group.members.some(memberId => memberId.toString() === req.user?._id.toString())) {
      res.status(403).json({ message: 'Not authorized to view this group' });
      return;
    }
    
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { id } = req.params;
    const { name, bio, interests, photos, members } = req.body;
    
    const group = await Group.findById(id);
    
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Check if user is the creator of the group
    if (group.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this group' });
      return;
    }
    
    if (name) group.name = name;
    if (bio) group.bio = bio;
    if (interests) group.interests = interests;
    if (photos) group.photos = photos;
    if (members) group.members = members;
    
    await group.save();
    
    res.json(group);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const { id } = req.params;
    
    const group = await Group.findById(id);
    
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }
    
    // Check if user is the creator of the group
    if (group.createdBy.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this group' });
      return;
    }
    
    await group.deleteOne();
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}; 