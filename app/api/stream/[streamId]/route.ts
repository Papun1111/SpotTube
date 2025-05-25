// app/api/stream/[streamId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // adjust path as needed
import { prismaClient } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  const { streamId } = params;

  // 1. Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Authorize
  const user = await prismaClient.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stream = await prismaClient.stream.findUnique({
    where: { id: streamId },
  });
  if (!stream) {
    return NextResponse.json({ error: "Stream not found." }, { status: 404 });
  }
  if (stream.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 3. Clean up related records, then delete the Stream
    await prismaClient.$transaction([
      // delete any UpVotes for this stream
      prismaClient.upVote.deleteMany({
        where: { streamId },
      }),
      // delete any CurrentStream entries pointing here
      prismaClient.currentStream.deleteMany({
        where: { streamId },
      }),
      // finally delete the stream
      prismaClient.stream.delete({
        where: { id: streamId },
      }),
    ]);

    return NextResponse.json(
      { message: "Stream and related votes removed successfully." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error deleting stream:", err);
    return NextResponse.json(
      { error: "Could not delete stream." },
      { status: 500 }
    );
  }
}
