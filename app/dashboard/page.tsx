"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowUpCircle, Music, Share2, ThumbsUp } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const REFRESH_INTERVAL_MS = 10_000;

interface VideoItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  upvotes: number;
  haveUpvoted: boolean;
}

export default function Dashboard() {
  const { status } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoIdInput, setVideoIdInput] = useState("");
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Identify user
  useEffect(() => {
    if (status !== "authenticated") return;
    axios
      .get<{ id: string }>("/api/user")
      .then((res) => setUserId(res.data.id))
      .catch(() => setError("Unable to identify user"));
  }, [status]);

  // Load user's streams
  const refreshStreams = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ streams: any[] }>("/api/stream/my");
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
  }, [userId]);

  useEffect(() => {
    refreshStreams();
    const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshStreams]);

  // Add a new stream
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoIdInput || !userId) return;
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/stream", { creatorId: userId, url: videoUrl });
      setVideoUrl("");
      setVideoIdInput("");
      await refreshStreams();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add stream");
    } finally {
      setLoading(false);
    }
  };

  // Extract video ID from URL
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    const match = url.match(/^.*(?:youtu\.be\/|v=)([^#&?]{11}).*/);
    setVideoIdInput(match?.[1] ?? "");
  };

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

  // Upvote/downvote
  const toggleVote = async (id: string, voted: boolean) => {
    setLoading(true);
    try {
      const endpoint = voted ? "/api/stream/downvote" : "/api/stream/upvote";
      await axios.post(endpoint, { streamId: id });
      await refreshStreams();
    } catch (err: any) {
      setError(err.response?.data?.message || "Vote failed");
    } finally {
      setLoading(false);
    }
  };

  // Share link
  const handleShare = () => {
    if (!userId) return;
    const shareUrl = `${window.location.origin}/creator/${userId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  if (status === "loading") return <p>Checking sign-in…</p>;
  if (status === "unauthenticated") return <p>Please sign in to view your dashboard.</p>;

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b bg-gray-100">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="#" className="flex items-center gap-2 font-semibold">
            <Music className="h-6 w-6 text-black" />
            <span>StreamTunes</span>
          </Link>
          <nav className="ml-auto flex gap-4">
            <Button variant="ghost">Dashboard</Button>
            <Button variant="ghost">History</Button>
            <Button variant="ghost">Settings</Button>
            <Button variant="ghost" onClick={handleShare}>
              <Share2 className="h-5 w-5 text-black" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto grid gap-6 px-4 py-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Now Playing & Add Video */}
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <Card className="bg-white border-gray-300">
            <CardHeader>
              <CardTitle>Now Playing</CardTitle>
              <CardDescription>Live stream for viewers</CardDescription>
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

          <Card className="bg-white border-gray-300">
            <CardHeader>
              <CardTitle>Add a Video</CardTitle>
              <CardDescription>Paste a YouTube link below</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="YouTube URL…"
                  value={videoUrl}
                  onChange={handleUrlChange}
                  className="flex-1"
                />
                <Button type="submit" disabled={!videoIdInput || loading}>
                  {loading ? "Adding…" : <ArrowUpCircle className="mr-2 h-4 w-4" />} Add
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Queue List */}
        <div className="md:col-span-1">
          <Card className="bg-white border-gray-300">
            <CardHeader>
              <CardTitle>Queue</CardTitle>
              <CardDescription>Vote or play</CardDescription>
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