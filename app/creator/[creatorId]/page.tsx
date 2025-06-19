"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Music, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
    <div className="min-h-screen bg-gray-900 text-white">
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-gray-700 bg-gray-800"
      >
        <div className="container mx-auto flex h-14 sm:h-16 items-center px-3 sm:px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Music className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            </motion.div>
            <span className="text-sm sm:text-base text-white">StreamTunes Fan Page</span>
          </Link>
        </div>
      </motion.header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {/* Video Player Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-3 order-1 lg:order-1"
          >
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl text-white">Now Playing</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-300">
                  You&apos;re watching {creatorId}&apos;s stream
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <AnimatePresence mode="wait">
                  {queue.length > 0 && (
                    <motion.div 
                      key={queue[currentIndex].videoId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="aspect-video rounded overflow-hidden border border-gray-600"
                    >
                      <iframe
                        key={queue[currentIndex].videoId}
                        src={`https://www.youtube.com/embed/${queue[currentIndex].videoId}?autoplay=1`}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                {queue.length > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 sm:mt-4 flex justify-end"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={playNext} 
                        className="text-sm sm:text-base px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border-none"
                      >
                        Play Next
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
                <AnimatePresence>
                  {loading && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm sm:text-base text-gray-300"
                    >
                      Loading…
                    </motion.p>
                  )}
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      className="mt-2 text-red-400 text-sm sm:text-base"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Queue Section */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="lg:col-span-1 order-2 lg:order-2"
          >
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl text-white">Up Next</CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-300">
                  Vote to influence the queue order
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <AnimatePresence>
                    {queue.map((video, idx) => (
                      <motion.div 
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: idx * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)"
                        }}
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded cursor-pointer transition-all ${
                          idx === currentIndex 
                            ? 'bg-blue-900/50 border border-blue-500/30' 
                            : 'hover:bg-gray-700/50 border border-transparent'
                        }`} 
                        onClick={() => setCurrentIndex(idx)}
                      >
                        {/* Thumbnail */}
                        <motion.img 
                          whileHover={{ scale: 1.05 }}
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="h-10 w-16 sm:h-12 sm:w-20 rounded object-cover flex-shrink-0 border border-gray-600" 
                        />
                        
                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-xs sm:text-sm font-medium leading-tight text-gray-100">
                            {video.title}
                          </div>
                        </div>
                        
                        {/* Voting Section */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          {/* Upvote */}
                          <div className="flex items-center gap-1">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button 
                                variant={video.haveUpvoted ? "secondary" : "outline"} 
                                size="icon" 
                                className={`h-6 w-6 sm:h-8 sm:w-8 ${
                                  video.haveUpvoted 
                                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-500' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                                }`}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  toggleVote(video.id, 'up'); 
                                }}
                              >
                                <ThumbsUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Button>
                            </motion.div>
                            <motion.span 
                              key={video.upvotes}
                              initial={{ scale: 1.2, color: "#10b981" }}
                              animate={{ scale: 1, color: "#e5e7eb" }}
                              transition={{ duration: 0.3 }}
                              className="text-xs font-medium min-w-[16px] sm:min-w-[20px] text-center text-gray-200"
                            >
                              {video.upvotes}
                            </motion.span>
                          </div>
                          
                          {/* Downvote */}
                          <div className="flex items-center gap-1">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button 
                                variant={video.haveDownvoted ? "destructive" : "outline"} 
                                size="icon"
                                className={`h-6 w-6 sm:h-8 sm:w-8 ${
                                  video.haveDownvoted 
                                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-500' 
                                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600'
                                }`}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  toggleVote(video.id, 'down'); 
                                }}
                              >
                                <ThumbsDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Button>
                            </motion.div>
                            <motion.span 
                              key={video.downvotes}
                              initial={{ scale: 1.2, color: "#ef4444" }}
                              animate={{ scale: 1, color: "#e5e7eb" }}
                              transition={{ duration: 0.3 }}
                              className="text-xs font-medium min-w-[16px] sm:min-w-[20px] text-center text-gray-200"
                            >
                              {video.downvotes}
                            </motion.span>
                          </div>
                          
                          {/* Net votes */}
                          <motion.div 
                            key={video.upvotes - video.downvotes}
                            initial={{ scale: 1.1, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-xs text-gray-400 font-medium"
                          >
                            Net: +{video.upvotes - video.downvotes}
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}