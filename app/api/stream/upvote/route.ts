// File: /api/stream/upvote.ts

import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpVoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  // 1. Ensure user is logged in
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json(
      { message: "Unauthenticated" },
      { status: 401 }
    );
  }

  // 2. Look up the user
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
    const { streamId } = UpVoteSchema.parse(await req.json());

    // 4. Try to create the upvote
    await prismaClient.upVote.create({
      data: {
        userId: user.id,
        streamId,
      },
    });

    // 5. Success!
    return NextResponse.json(
      { message: "Upvoted successfully" },
      { status: 200 }
    );

  } catch (err: any) {
    // Zod validation error
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", errors: err.errors },
        { status: 422 }
      );
    }

    // Prisma unique constraint (user already upvoted)
    if (err.code === "P2002" && err.meta?.target?.includes("userId_streamId")) {
      return NextResponse.json(
        { message: "Already upvoted" },
        { status: 409 }
      );
    }

    // Anything else
    console.error("Upvote error:", err);
    return NextResponse.json(
      { message: "Failed to upvote" },
      { status: 500 }
    );
  }
}
