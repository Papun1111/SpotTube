// app/api/stream/my/route.ts

import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

  // 3. Fetch streams with vote counts and whether this user has voted
  const streams = await prismaClient.stream.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { upvotes: true },
      },
      upvotes: {
        where: { userId: user.id },
      },
    },
  });

  // 4. Shape response
  const payload = streams.map((s) => ({
    id: s.id,
    type: s.type,
    url: s.url,
    extractedId: s.extractedId,
    title: s.title,
    smallImg: s.smallImg,
    bigImg: s.bigImg,
    active: s.active,
    upvotes: s._count.upvotes,
    haveUpvoted: s.upvotes.length > 0,
  }));

  return NextResponse.json({ streams: payload });
}
