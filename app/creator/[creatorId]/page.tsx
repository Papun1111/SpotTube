"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Music, ThumbsUp, ThumbsDown } from "lucide-react";
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

interface VideoItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  upvotes: number;
  downvotes: number;
  haveUpvoted: boolean;
  haveDownvoted: boolean;
}

export default function CreatorStreamPage() {
  const params = useParams();
  const creatorId = params?.creatorId as string;

  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchStreams = useCallback(async () => {
    if (!creatorId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ stream: any[] }>("/api/stream", {
        params: { creatorId },
      });
      const items = res.data.stream.map((s) => ({
        id: s.id,
        videoId: s.extractedId,
        title: s.title,
        thumbnail: s.smallImg,
        upvotes: s._count?.upvotes ?? 0,
        downvotes: s._count?.downvotes ?? 0,
        haveUpvoted: s.upvotes?.length > 0,
        haveDownvoted: s.downvotes?.length > 0,
      }));
      // Sort by net votes (upvotes - downvotes) descending
      items.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      setQueue(items);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load creator's streams");
    } finally {
      setLoading(false);
    }
  }, [creatorId]);

  useEffect(() => {
    fetchStreams();
    const iv = setInterval(fetchStreams, 10000);
    return () => clearInterval(iv);
  }, [fetchStreams]);

  const playNext = () => {
    // Always play the top voted song (index 0 after sorting)
    setCurrentIndex(0);
  };

  const toggleVote = async (streamId: string, voteType: 'up' | 'down') => {
    setLoading(true);
    try {
      const currentItem = queue.find(item => item.id === streamId);
      if (!currentItem) return;

      let endpoint = "";
      
      if (voteType === 'up') {
        endpoint = currentItem.haveUpvoted ? "/api/stream/downvote" : "/api/stream/upvote";
      } else {
        endpoint = currentItem.haveDownvoted ? "/api/stream/upvote" : "/api/stream/downvote";
      }

      await axios.post(endpoint, { streamId });
      await fetchStreams(); // Refresh to get updated votes and re-sort
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
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="bg-white border-gray-300">
            <CardHeader>
              <CardTitle>Now Playing</CardTitle>
              <CardDescription>You&apos;re watching {creatorId}&apos;s stream</CardDescription>
            </CardHeader>
            <CardContent>
              {queue.length > 0 && (
                <div className="aspect-video rounded overflow-hidden border">
                  <iframe
                    key={queue[currentIndex].videoId}
                    src={`https://www.youtube.com/embed/${queue[currentIndex].videoId}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              )}
              {queue.length > 1 && (
                <div className="mt-2 flex justify-end">
                  <Button onClick={playNext}>Play Next</Button>
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
              <CardDescription>Vote to influence the queue order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queue.map((video, idx) => (
                  <div key={video.id} className={`flex items-center gap-3 p-2 rounded cursor-pointer ${idx === currentIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`} onClick={() => setCurrentIndex(idx)}>
                    <img src={video.thumbnail} alt={video.title} className="h-12 w-20 rounded object-cover" />
                    <div className="flex-1 truncate text-sm font-medium">{video.title}</div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant={video.haveUpvoted ? "secondary" : "outline"} 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleVote(video.id, 'up'); 
                          }}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium min-w-[20px] text-center">
                          {video.upvotes}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant={video.haveDownvoted ? "destructive" : "outline"} 
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleVote(video.id, 'down'); 
                          }}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium min-w-[20px] text-center">
                          {video.downvotes}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        Net: +{video.upvotes - video.downvotes}
                      </div>
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