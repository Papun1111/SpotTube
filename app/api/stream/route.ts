export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const YT_REGEX = new RegExp(
  "^https?:\\/\\/(?:www\\.)?(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([A-Za-z0-9_-]{11})(?:\\S*)?$"
);

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

type Thumbnail = {
  url: string;
  width: number;
  height: number;
};

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    const isYt = YT_REGEX.test(data.url);

    if (!isYt) {
      return NextResponse.json({ message: "Wrong URL format" }, { status: 400 });
    }

    const extractedId =
      data.url.includes("?v=")
        ? data.url.split("?v=")[1].substring(0, 11)
        : data.url.split("/").pop()?.substring(0, 11) || "";

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "YouTube API key not found" }, { status: 500 });
    }

    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${extractedId}&key=${apiKey}`
    );

    const ytData = await ytRes.json();

    if (!ytData.items || ytData.items.length === 0) {
      return NextResponse.json({ message: "Invalid YouTube video ID" }, { status: 404 });
    }

    const snippet = ytData.items[0].snippet;
    const title = snippet.title;
    const thumbnails = snippet.thumbnails;

    const sortedThumbs: Thumbnail[] = Object.values(thumbnails) as Thumbnail[];
    sortedThumbs.sort((a, b) => a.width - b.width);

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title,
        smallImg:
          sortedThumbs.length > 1
            ? sortedThumbs[sortedThumbs.length - 2].url
            : sortedThumbs[sortedThumbs.length - 1].url ?? "",
        bigImg: sortedThumbs[sortedThumbs.length - 1].url ?? "",
      },
    });

    return NextResponse.json(
      { message: "Stream added successfully", id: stream.id },
      { status: 200 }
    );
  } catch (e) {
    console.error("POST stream error:", e);
    return NextResponse.json({ message: "Error while adding stream" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");

  const stream = await prismaClient.stream.findMany({
    where: {
      userId: creatorId ?? "",
    },
  });

  return NextResponse.json({ stream });
}
