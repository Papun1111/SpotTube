import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const UpVoteSchema = z.object({
  streamId: z.string(),
});

export async function POST(req: NextRequest) {
  // 1. Ensure user is authenticated
  const session = await getServerSession(authOptions);
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
    const { streamId } = UpVoteSchema.parse(await req.json());

    // 4. Check if user has already upvoted this stream
    const existingUpvote = await prismaClient.upVote.findUnique({
      where: {
        userId_streamId: {
          userId: user.id,
          streamId,
        },
      },
    });

    if (existingUpvote) {
      return NextResponse.json(
        { message: "Already upvoted" },
        { status: 409 }
      );
    }

    // 5. Create the upvote record
    await prismaClient.upVote.create({
      data: {
        userId: user.id,
        streamId,
      },
    });

    // 6. Return success
    return NextResponse.json(
      { message: "Upvoted successfully" },
      { status: 201 }
    );

  } catch (err: any) {
    // 7a. Zod validation error
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid payload", errors: err.errors },
        { status: 422 }
      );
    }
    // 7b. Prisma unique constraint violation (shouldn't happen due to check above)
    if (err.code === "P2002") {
      return NextResponse.json(
        { message: "Already upvoted" },
        { status: 409 }
      );
    }
    // 7c. Foreign key constraint (streamId doesn't exist)
    if (err.code === "P2003") {
      return NextResponse.json(
        { message: "Stream not found" },
        { status: 404 }
      );
    }
    // 7d. Fallback for other errors
    console.error("Upvote error:", err);
    return NextResponse.json(
      { message: "Failed to upvote" },
      { status: 500 }
    );
  }
}