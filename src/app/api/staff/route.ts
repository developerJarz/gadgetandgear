import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Staff } from "@/lib/models/Staff";

export async function GET() {
  try {
    await connectDB();
    const staff = await Staff.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(staff);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const member = await Staff.create({
      name: body.name,
      email: body.email,
      role: body.role,
      joinedAt: new Date(),
      lastActive: new Date(),
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
