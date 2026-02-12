







// // app/api/rooms/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Room from '@/models/Room';
// import { verifyToken } from '@/lib/auth';
// import mongoose from 'mongoose';


// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {

//   try {
//     // Verify authentication
//     const authHeader = request.headers.get('authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return NextResponse.json(
//         { message: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const token = authHeader.substring(7);
//     const user = verifyToken(token);
    
//     if (!user) {
//       return NextResponse.json(
//         { message: 'Invalid token' },
//         { status: 401 }
//       );
//     }

//     await connectDB();

//     const { id } = params;

//      // 🔥 VERY IMPORTANT: validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return NextResponse.json(
//         { message: 'Invalid room ID' },
//         { status: 400 }
//       );
//     }

//     // Get room details
//     const room = await Room.findById(id)
//       .populate('members', 'displayName avatar email')
//       .populate('createdBy', 'displayName avatar email');

//     if (!room) {
//       return NextResponse.json(
//         { message: 'Room not found' },
//         { status: 404 }
//       );
//     }

//     // Check if user is a member
//     const isMember = room.members.some(
//       (member: any) => member._id.toString() === user.userId
//     );

//     if (!isMember) {
//       return NextResponse.json(
//         { message: 'You are not a member of this room' },
//         { status: 403 }
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       data: { room },
//     });
//   } catch (error: any) {
//     console.error('Get room error:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }






// app/api/rooms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Room from '@/models/Room';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params (NEW in Next 16)
    const { id } = await context.params;

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

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid room ID' },
        { status: 400 }
      );
    }

    const room = await Room.findById(id)
      .populate('members', 'displayName avatar email')
      .populate('createdBy', 'displayName avatar email');

    if (!room) {
      return NextResponse.json(
        { message: 'Room not found' },
        { status: 404 }
      );
    }

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
