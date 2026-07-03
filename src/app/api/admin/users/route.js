import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { db } from "@/lib/auth";
import { getCurrentAdmin } from "@/lib/admin-auth";

function getUserFilter(userId) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }

  return { _id: new ObjectId(userId) };
}

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await db
      .collection("user")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const filter = getUserFilter(data.userId);

    if (!filter) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const targetUser = await db.collection("user").findOne(filter);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "Admin account cannot be changed" },
        { status: 403 }
      );
    }

    const updateData = { updatedAt: new Date() };

    if (data.action === "make-buyer") {
      updateData.role = "buyer";
    }

    if (data.action === "make-seller") {
      updateData.role = "seller";
      updateData.plan = "free";
    }

    if (data.action === "block") {
      updateData.accountStatus = "blocked";
    }

    if (data.action === "suspend") {
      updateData.accountStatus = "suspended";
    }

    if (data.action === "unblock" || data.action === "unsuspend") {
      updateData.accountStatus = "active";
    }

    const result = await db.collection("user").updateOne(filter, {
      $set: updateData,
    });

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
