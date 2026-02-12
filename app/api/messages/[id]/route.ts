// app/api/messages/[roomId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    // Verify authentication
    // const authHeader = request.headers.get('authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return NextResponse.json(
    //     { message: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // const token = authHeader.substring(7);
    // const user = verifyToken(token);
    
    // if (!user) {
    //   return NextResponse.json(
    //     { message: 'Invalid token' },
    //     { status: 401 }
    //   );
    // }

    await connectDB();

    const { id } = await params;
    console.log("Fetching messages for Room ID:", id);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Get messages for the room
    const messages = await Message.find({
       roomId: id, 
      })
      .populate('userId', 'displayName avatar email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

      console.log(messages);

    // Reverse to get chronological order
    messages.reverse();

    return NextResponse.json({
      success: true,
      data: {
        messages,
        count: messages.length,
      },
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}




// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Message from "@/models/Message";
// import { verifyToken } from "@/lib/auth";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const authHeader = req.headers.get("authorization");

//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.substring(7);
//     const decoded = verifyToken(token);

//     if (!decoded) {
//       return NextResponse.json({ message: "Invalid token" }, { status: 401 });
//     }

//     await connectDB();

//     const messages = await Message.find({
//       roomId: params.id,   // 🔥 important
//     })
//       .populate("userId", "displayName avatar email")
//       .sort({ createdAt: 1 });
      
//       console.log("GET MESSAGES - Room ID:", params);
//       console.log("Params Room ID:", params);
//       console.log("Fetched Messages:", messages);

//     return NextResponse.json({
//       success: true,
//       data: { messages },
//     });
//   } catch (err) {
//     console.error("GET MESSAGES ERROR:", err);
//     return NextResponse.json(
//       { message: "Server error" },
//       { status: 500 }
//     );
//   }
// }
