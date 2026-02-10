import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {


  try {
    // const auth = req.headers.get("authorization");

    // if (!auth?.startsWith("Bearer ")) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    // const token = auth.substring(7);
    // const decoded = verifyToken(token);

    // if (!decoded) {
    //   return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    // }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();
        const { id } = await params;

    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const room = await Room.findById(id);

    if (!room) {
      return NextResponse.json(
        { message: "Room not found" },
        { status: 404 }
      );
    }

    // Already member?
    if (room.members.includes(userToAdd._id)) {
      return NextResponse.json(
        { message: "User already in room" },
        { status: 400 }
      );
    }

    room.members.push(userToAdd._id);
    await room.save();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: userToAdd._id,
          displayName: userToAdd.displayName,
          email: userToAdd.email,
          avatar: userToAdd.avatar,
        },
      },
    });
  } catch (err) {
    console.error("ADD MEMBER ERROR:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
