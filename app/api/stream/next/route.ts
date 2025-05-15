import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();

  const user = await prismaClient.user.findFirst({
    where: {
      email: session?.user?.email ?? "",
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: "Unauthenticated" },
      { status: 403 }
    );
  }

  const mostUpvotedSchema = await prismaClient.stream.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      upvotes: {
        _count: "desc",
      },
    },
  });

  // If there's no stream to upsert and delete, exit early
  if (!mostUpvotedSchema?.id) {
    return NextResponse.json(
      { message: "No stream found for upsert and delete" },
      { status: 404 }
    );
  }

  await Promise.all([
    prismaClient.currentStream.upsert({
      where: {
        userId: user.id,
      },
      update: {
        streamId: mostUpvotedSchema.id,
      },
      create: {
        userId: user.id,
        streamId: mostUpvotedSchema.id,
      },
    }),
    prismaClient.stream.delete({
      where: {
        id: mostUpvotedSchema.id,
      },
    }),
  ]);

  return NextResponse.json(
   {stream:mostUpvotedSchema}
  );
}
