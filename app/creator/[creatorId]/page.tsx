"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Music, ThumbsUp } from "lucide-react";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const REFRESH_INTERVAL_MS = 10000;

interface VideoItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  upvotes: number;
  haveUpvoted: boolean;
}

export default function CreatorStreamPage() {
  const params = useParams();
  const creatorId = params?.creatorId as string;

  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch creator's streams
  const fetchStreams = useCallback(async () => {
    if (!creatorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ streams: any[] }>("/api/stream", { params: { creatorId } });
      const items: VideoItem[] = res.data.streams.map((s) => ({
        id: s.id,
        videoId: s.extractedId,
        title: s.title,
        thumbnail: s.smallImg,
        upvotes: s._count?.upvotes ?? 0,
        haveUpvoted: s.upvotes?.length > 0,
      }));
      items.sort((a, b) => b.upvotes - a.upvotes);
      setQueue(items);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load streams");
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    fetchStreams();
    const iv = setInterval(fetchStreams, REFRESH_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [fetchStreams]);

  // Fetch next top-voted stream
  const handleNextStream = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ stream: any }>("/api/stream/next");
      const s = res.data.stream;
      const next: VideoItem = {
        id: s.id,
        videoId: s.extractedId,
        title: s.title,
        thumbnail: s.smallImg,
        upvotes: s._count?.upvotes ?? 0,
        haveUpvoted: false,
      };
      setQueue((prev) => [next, ...prev.filter((v) => v.id !== next.id)]);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch next stream");
    } finally {
      setLoading(false);
    }
  };

  // Toggle upvote
  const toggleVote = async (id: string, voted: boolean) => {
    setLoading(true);
    try {
      const endpoint = voted ? "/api/stream/downvote" : "/api/stream/upvote";
      await axios.post(endpoint, { streamId: id });
      await fetchStreams();
    } catch (err: any) {
      setError(err.response?.data?.message || "Vote failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b bg-gray-100">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Music className="h-6 w-6 text-black" />
            <span>StreamTunes</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto grid gap-6 px-4 py-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <Card className="bg-white border-gray-300">
            <CardHeader>
              <CardTitle>Now Playing</CardTitle>
              <CardDescription>Viewing {creatorId}'s stream</CardDescription>
            </CardHeader>
            <CardContent>
              {queue.length > 0 ? (
                <div className="aspect-video rounded overflow-hidden border">
                  <iframe
                    key={queue[currentIndex].videoId}
                    src={`https://www.youtube.com/embed/${queue[currentIndex].videoId}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p>No streams available</p>
              )}
              {queue.length > 1 && (
                <div className="mt-2 flex justify-end">
                  <Button onClick={handleNextStream}>Play Next</Button>
                </div>
              )}
              {loading && <p className="mt-2">Loading…</p>}
              {error && <p className="mt-2 text-red-600">{error}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="bg-white border-gray-300">
            <CardHeader>
              <CardTitle>Up Next</CardTitle>
              <CardDescription>Top voted songs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queue.map((video, idx) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => setCurrentIndex(idx)}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-12 w-20 rounded object-cover"
                    />
                    <div className="flex-1 truncate text-sm font-medium">{video.title}</div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant={video.haveUpvoted ? "secondary" : "outline"}
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVote(video.id, video.haveUpvoted);
                        }}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">{video.upvotes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
