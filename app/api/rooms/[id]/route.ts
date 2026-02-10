







// app/api/rooms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

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

    const { id } = await params;

    // Get room details
    const room = await Room.findById(id)
      .populate('members', 'displayName avatar email')
      .populate('createdBy', 'displayName avatar email');

    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if user is a member
    const isMember = room.members.some(
      (member: any) => member._id.toString() === user.userId
    );

    if (!isMember) {
      return NextResponse.json(
        { message: 'You are not a member of this room' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { room },
    });
  } catch (error: any) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}