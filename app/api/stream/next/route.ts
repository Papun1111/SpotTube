// app/api/stream/next/route.ts

import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  // 1. Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Load user
  const user = await prismaClient.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 3. Fetch all streams with vote‐counts
  const streams = await prismaClient.stream.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { upvotes: true } },
    },
  });

  if (streams.length === 0) {
    return NextResponse.json(
      { error: "No streams available" },
      { status: 404 }
    );
  }

  // 4. Check if all upvote counts are identical
  const counts = streams.map((s) => s._count.upvotes);
  const allSame = counts.every((c) => c === counts[0]);

  let chosen: typeof streams[number];

  if (allSame) {
    // 5a. Rotate: get last played
    const curr = await prismaClient.currentStream.findUnique({
      where: { userId: user.id },
    });

    // sort by ID (UUID lex order) for a consistent “queue”
    const sorted = [...streams].sort((a, b) => a.id.localeCompare(b.id));

    if (curr?.streamId) {
      const idx = sorted.findIndex((s) => s.id === curr.streamId);
      const nextIdx = (idx + 1) % sorted.length;
      chosen = sorted[nextIdx];
    } else {
      chosen = sorted[0];
    }
  } else {
    // 5b. Otherwise pick the highest‐voted (break ties arbitrarily by ID)
    chosen = streams
      .sort((a, b) => {
        const diff = b._count.upvotes - a._count.upvotes;
        return diff !== 0 ? diff : a.id.localeCompare(b.id);
      })[0];
  }

  // 6. Upsert currentStream & delete the chosen stream
  await prismaClient.currentStream.upsert({
    where: { userId: user.id },
    update: { streamId: chosen.id },
    create: { userId: user.id, streamId: chosen.id },
  });

  await prismaClient.stream.delete({
    where: { id: chosen.id },
  });

  // 7. Return the stream we’re about to play
  return NextResponse.json({ stream: chosen });
}
