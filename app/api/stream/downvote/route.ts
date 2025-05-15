// File: /api/stream/downvote.ts

import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const DownVoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  // 1. Ensure user is authenticated
  //
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthenticated" },
      { status: 401 }
    );
  }

  // 2. Find the user in the database
  const user = await prismaClient.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  try {
    // 3. Validate request body
    const { streamId } = DownVoteSchema.parse(await req.json());

    // 4. Delete the upvote record
    await prismaClient.upVote.delete({
      where: {
        userId_streamId: {
          userId: user.id,
          streamId,
        },
      },
    });

    // 5. Return success
    return NextResponse.json(
      { message: "Downvoted successfully" },
      { status: 200 }
    );

  } catch (err: any) {
    // 6a. Zod validation error
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", errors: err.errors },
        { status: 422 }
      );
    }
    // 6b. Prisma "record not found" when no upvote exists
    if (err.code === "P2025") {
      return NextResponse.json(
        { message: "No existing vote to remove" },
        { status: 404 }
      );
    }
    // 6c. Fallback for other errors
    console.error("Downvote error:", err);
    return NextResponse.json(
      { message: "Failed to downvote" },
      { status: 500 }
    );
  }
}
