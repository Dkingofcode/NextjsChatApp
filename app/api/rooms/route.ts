// app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

// GET - Get all rooms for the authenticated user
export async function GET(request: NextRequest) {
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

    // Get all rooms where user is a member
    const rooms = await Room.find({
      members: user.userId
    })
      .populate('createdBy', 'displayName avatar email')
      .populate('members', 'displayName avatar email')
      .sort({ lastActivity: -1 });

    return NextResponse.json({
      success: true,
      data: { rooms },
    });
  } catch (error: any) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new room
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
    const { name, type, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Room name is required' },
        { status: 400 }
      );
    }

    // Create room
    const room = await Room.create({
      name: name.trim(),
      type: type || 'group',
      description: description?.trim() || '',
      createdBy: user.userId,
      members: [user.userId],
    });

    // Populate creator details
    await room.populate('createdBy', 'displayName avatar email');
    await room.populate('members', 'displayName avatar email');

    return NextResponse.json({
      success: true,
      message: 'Room created successfully',
      data: { room },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}