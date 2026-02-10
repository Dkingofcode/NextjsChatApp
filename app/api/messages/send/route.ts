// app/api/messages/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { roomId, text } = body;

    if (!roomId || !text || !text.trim()) {
      return NextResponse.json(
        { message: 'Room ID and message text are required' },
        { status: 400 }
      );
    }

    // Verify room exists and user is a member
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }

    const isMember = room.members.some(
      (memberId) => memberId.toString() === user.userId
    );

    if (!isMember) {
      return NextResponse.json(
        { message: 'You are not a member of this room' },
        { status: 403 }
      );
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

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: { message },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}