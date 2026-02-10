// pages/api/messages/send.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import Message from '../../../models/Message';
import Room from '../../../models/Room';
import { getUserFromRequest } from '../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await connectDB();

    const { roomId, text } = req.body;

    if (!roomId || !text || !text.trim()) {
      return res.status(400).json({ message: 'Room ID and message text are required' });
    }

    // Verify room exists and user is a member
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isMember = room.members.some(
      (memberId) => memberId.toString() === user.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this room' });
    }

    // Create message
    const message = await Message.create({
      roomId,
      userId: user.userId,
      text: text.trim(),
    });

    // Update room last activity
    room.lastActivity = new Date();
    await room.save();

    // Populate user details
    await message.populate('userId', 'displayName avatar email');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message },
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}