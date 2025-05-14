import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";

const YT_REGEX = new RegExp(
  "^https?:\\/\\/(?:www\\.)?(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([A-Za-z0-9_-]{11})(?:\\S*)?$"
);

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    const isYt = YT_REGEX.test(data.url);

    if (!isYt) {
      return NextResponse.json({ message: "Wrong URL format" }, { status: 411 });
    }

    const extractedId =
      data.url.includes("?v=")
        ? data.url.split("?v=")[1].substring(0, 11)
        : data.url.split("/").pop()?.substring(0, 11) || "";

    const res = await youtubesearchapi.GetVideoDetails(extractedId);

    const thumbnails = res?.thumbnail?.thumbnails || [];

    thumbnails.sort(
      (a: { width: number }, b: { width: number }) => (a.width < b.width ? -1 : 1)
    );

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: "Youtube",
        title: res?.title ?? "cannot find title",
        smallImg:
          thumbnails.length > 1
            ? thumbnails[thumbnails.length - 2].url
            : thumbnails[thumbnails.length - 1].url ?? "",
        bigImg: thumbnails[thumbnails.length - 1].url ?? "",
      },
    });

    return NextResponse.json(
      { message: "Stream added successfully", id: stream.id },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Error while adding stream" },
      { status: 411 }
    );
  }
}
export async function GET(req:NextRequest){
const creatorId=req.nextUrl.searchParams.get("creatorId");
const stream=await prismaClient.stream.findMany({
    where:{
        userId:creatorId??""
    }
})

return NextResponse.json({
    stream
})
}