"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowUpCircle, Music, Share2, ThumbsUp, Trash, Play, Menu, X, SkipForward } from "lucide-react";
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
  addedAt?: number; // For tracking arrival order
}

export default function Dashboard() {
  const { status } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoIdInput, setVideoIdInput] = useState("");
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  
  // Refs for tracking video state
  const currentVideoRef = useRef<string>("");
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Identify user
  useEffect(() => {
    if (status !== "authenticated") return;
    axios
      .get<{ id: string }>("/api/user")
      .then(res => setUserId(res.data.id))
      .catch(() => setError("Unable to identify user"));
  }, [status]);

  // Sort queue by votes (highest first), then by addedAt (earliest first) for same votes
  const getSortedQueue = useCallback((items: VideoItem[]): VideoItem[] => {
    return [...items].sort((a, b) => {
      // Primary sort: by votes (descending - highest votes first)
      if (b.upvotes !== a.upvotes) {
        return b.upvotes - a.upvotes;
      }
      
      // Secondary sort: by arrival time (ascending - earlier added first)
      const aTime = a.addedAt || 0;
      const bTime = b.addedAt || 0;
      if (aTime !== bTime) {
        return aTime - bTime;
      }
      
      // Tertiary sort: by ID for consistency
      return a.id.localeCompare(b.id);
    });
  }, []);

  // Get next unplayed song index based on priority
  const getNextSongIndex = useCallback((queueItems: VideoItem[], played: Set<string>): number => {
    const sortedQueue = getSortedQueue(queueItems);
    
    // Find highest priority unplayed song
    for (let i = 0; i < sortedQueue.length; i++) {
      if (!played.has(sortedQueue[i].id)) {
        // Find this song's index in the original queue
        const originalIndex = queueItems.findIndex(item => item.id === sortedQueue[i].id);
        return originalIndex >= 0 ? originalIndex : i;
      }
    }
    
    // If all songs have been played, reset and start with highest priority
    if (queueItems.length > 0) {
      const highestPriorityId = sortedQueue[0]?.id;
      const originalIndex = queueItems.findIndex(item => item.id === highestPriorityId);
      return originalIndex >= 0 ? originalIndex : 0;
    }
    
    return 0;
  }, [getSortedQueue]);

  // Auto-play next song functionality
  const playNextSong = useCallback(async () => {
    if (queue.length === 0) return;
    
    // Mark current song as played
    if (queue[currentIndex]) {
      setPlayedSongs(prev => new Set([...prev, queue[currentIndex].id]));
    }
    
    // Get fresh data and determine next song
    try {
      await refreshStreams();
    } catch (error) {
      console.error("Failed to refresh streams for auto-play:", error);
    }
  }, [queue, currentIndex]);

  // Auto-play timer setup
  useEffect(() => {
    if (!autoPlay || !isPlaying || queue.length <= 1) return;
    
    // Clear existing timer
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    
    // Set timer for auto-play (simulate video end - in real app, you'd listen to iframe events)
    // For demo purposes, auto-advance after 30 seconds
    autoPlayTimerRef.current = setTimeout(() => {
      playNextSong();
    }, 30000);
    
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [isPlaying, currentIndex, autoPlay, playNextSong]);

  // Load user's streams with enhanced sorting
  const refreshStreams = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<{ streams: any[] }>("/api/stream/my");
      const items: VideoItem[] = res.data.streams.map((s, index) => ({
        id: s.id,
        videoId: s.extractedId,
        title: s.title,
        thumbnail: s.smallImg,
        upvotes: s._count?.upvotes ?? 0,
        haveUpvoted: s.upvotes?.length > 0,
        addedAt: s.createdAt ? new Date(s.createdAt).getTime() : Date.now() - (index * 1000), // Fallback for order
      }));
      
      // Sort the queue by priority
      const sortedItems = getSortedQueue(items);
      setQueue(sortedItems);
      
      // Determine current playing song
      const nextSongIndex = getNextSongIndex(sortedItems, playedSongs);
      setCurrentIndex(nextSongIndex);
      
      // Update playing state
      if (sortedItems.length > 0 && !isPlaying) {
        setIsPlaying(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load streams");
    } finally {
      setLoading(false);
    }
  }, [userId, playedSongs, getSortedQueue, getNextSongIndex, isPlaying]);

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
      await axios.post("/api/stream", { 
        creatorId: userId, 
        url: videoUrl,
        addedAt: Date.now() // Track when added
      });
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
    setVideoIdInput(match?.[1] || "");
  };

  // Play next song manually
  const handleNextStream = async () => {
    await playNextSong();
  };

  // Manual song selection
  const handleSongSelect = (index: number) => {
    // Clear auto-play timer
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    
    // Mark current song as played before switching
    if (queue[currentIndex]) {
      setPlayedSongs(prev => new Set([...prev, queue[currentIndex].id]));
    }
    
    setCurrentIndex(index);
    setIsPlaying(true);
    
    // Mark the selected song as played
    if (queue[index]) {
      setPlayedSongs(prev => new Set([...prev, queue[index].id]));
    }
  };

  // Enhanced vote toggle with immediate UI update and queue reordering
  const toggleVote = async (id: string, voted: boolean) => {
    try {
      const endpoint = voted ? "/api/stream/downvote" : "/api/stream/upvote";
      await axios.post(endpoint, { streamId: id });
      
      // Immediately update local state for responsive UI
      setQueue(prev => {
        const updated = prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              upvotes: voted ? item.upvotes - 1 : item.upvotes + 1,
              haveUpvoted: !voted
            };
          }
          return item;
        });
        
        // Re-sort after vote change
        return getSortedQueue(updated);
      });
      
      // Update current index if queue order changed
      setTimeout(() => {
        const currentSongId = queue[currentIndex]?.id;
        if (currentSongId) {
          setQueue(prevQueue => {
            const newIndex = prevQueue.findIndex(item => item.id === currentSongId);
            if (newIndex >= 0 && newIndex !== currentIndex) {
              setCurrentIndex(newIndex);
            }
            return prevQueue;
          });
        }
      }, 100);
      
      // Refresh from server to ensure consistency
      setTimeout(() => refreshStreams(), 500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Vote failed");
    }
  };

  // Delete a stream
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stream?")) return;
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/stream/${id}`);
      
      // Remove from played songs set
      setPlayedSongs(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
      
      // If deleting current song, move to next
      if (queue[currentIndex]?.id === id) {
        const nextIndex = getNextSongIndex(queue.filter(q => q.id !== id), playedSongs);
        setCurrentIndex(nextIndex);
      }
      
      await refreshStreams();
    } catch (err: any) {
      setError(err.response?.data?.message || "Delete failed");
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

  // Reset played songs
  const handleResetPlayedSongs = () => {
    setPlayedSongs(new Set());
    if (queue.length > 0) {
      const sortedQueue = getSortedQueue(queue);
      const highestPriorityIndex = queue.findIndex(item => item.id === sortedQueue[0]?.id);
      setCurrentIndex(highestPriorityIndex >= 0 ? highestPriorityIndex : 0);
    }
  };

  // Toggle auto-play
  const toggleAutoPlay = () => {
    setAutoPlay(prev => !prev);
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300 animate-pulse">Checking sign-in…</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Music className="h-16 w-16 text-purple-500 mx-auto animate-bounce" />
          <p className="text-xl text-gray-300">Please sign in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  // Get display queue (sorted by priority for display)
  const displayQueue = getSortedQueue(queue);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center px-4 lg:px-6">
          <Link href="#" className="flex items-center gap-2 font-bold text-xl">
            <Music className="h-8 w-8 text-purple-500 animate-pulse" />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              StreamTunes
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="ml-auto hidden md:flex gap-2">
            <Button variant="ghost" className="text-white hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-white hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300">
              History
            </Button>
            <Button variant="ghost" className="text-white hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300">
              Settings
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleShare}
              className="text-white hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-300 hover:scale-105"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden text-white hover:bg-purple-500/20"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-lg border-t border-gray-700 animate-in slide-in-from-top-2 duration-300">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-purple-500/20">
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-purple-500/20">
                History
              </Button>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-purple-500/20">
                Settings
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleShare}
                className="w-full justify-start text-white hover:bg-purple-500/20"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-6 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Now Playing */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/10">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Now Playing
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      Live stream • {playedSongs.size} played • Queue sorted by votes
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="text-xs text-gray-400">{isPlaying ? 'LIVE' : 'PAUSED'}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {queue.length > 0 ? (
                  <div className="group">
                    <div className="aspect-video rounded-xl overflow-hidden border border-gray-600 bg-gray-900 hover:border-purple-500 transition-all duration-300">
                      <iframe
                        key={`${queue[currentIndex].videoId}-${currentIndex}`}
                        src={`https://www.youtube.com/embed/${queue[currentIndex].videoId}?autoplay=1&enablejsapi=1`}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {queue[currentIndex].title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          <span className="font-bold text-purple-400">{queue[currentIndex].upvotes} votes</span>
                          {' • '}Priority #{displayQueue.findIndex(item => item.id === queue[currentIndex].id) + 1}
                          {playedSongs.has(queue[currentIndex].id) && <span className="text-yellow-400"> • Played</span>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={toggleAutoPlay}
                          variant={autoPlay ? "default" : "outline"}
                          className={`transition-all duration-300 ${
                            autoPlay 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400'
                          }`}
                        >
                          Auto-play: {autoPlay ? 'ON' : 'OFF'}
                        </Button>
                        {queue.length > 1 && (
                          <Button 
                            onClick={handleNextStream}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                            disabled={loading}
                          >
                            <SkipForward className="mr-2 h-4 w-4" />
                            Next Song
                          </Button>
                        )}
                        <Button 
                          onClick={handleResetPlayedSongs}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:border-purple-500 hover:text-purple-400"
                          disabled={loading}
                        >
                          Reset Queue
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-900/50">
                    <div className="text-center">
                      <Music className="h-16 w-16 text-gray-500 mx-auto mb-4 animate-bounce" />
                      <p className="text-gray-400 text-lg">No streams available</p>
                      <p className="text-gray-500 text-sm mt-2">Add a video to get started</p>
                    </div>
                  </div>
                )}
                
                {loading && (
                  <div className="mt-4 flex items-center space-x-2 text-purple-400">
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="animate-pulse">Loading…</span>
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg animate-in slide-in-from-top-2">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Video */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-500/10">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white">Add a Video</CardTitle>
                <CardDescription className="text-gray-400">
                  Paste a YouTube link below - it will be queued by vote priority
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="text"
                    placeholder="YouTube URL…"
                    value={videoUrl}
                    onChange={handleUrlChange}
                    className="flex-1 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                  />
                  <Button 
                    type="submit" 
                    disabled={!videoIdInput || loading}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 sm:w-auto w-full"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding…
                      </div>
                    ) : (
                      <>
                        <ArrowUpCircle className="mr-2 h-4 w-4" />
                        Add to Queue
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Queue Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-lg hover:bg-gray-800/70 transition-all duration-500 sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <Music className="mr-2 h-5 w-5 text-purple-400" />
                  Priority Queue
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {queue.length} songs • Sorted by votes, then arrival order
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                  {displayQueue.map((video, idx) => {
                    const isCurrentlyPlaying = video.id === queue[currentIndex]?.id;
                    const originalIndex = queue.findIndex(item => item.id === video.id);
                    
                    return (
                      <div
                        key={video.id}
                        className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                          isCurrentlyPlaying
                            ? 'bg-purple-600/20 border border-purple-500/50 shadow-lg shadow-purple-500/10' 
                            : playedSongs.has(video.id)
                            ? 'bg-yellow-600/10 border border-yellow-500/30 opacity-70'
                            : 'bg-gray-700/30 hover:bg-gray-700/50 border border-transparent hover:border-gray-600'
                        }`}
                        onClick={() => handleSongSelect(originalIndex)}
                      >
                        <div className="relative">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="h-12 w-20 rounded-md object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isCurrentlyPlaying && (
                            <div className="absolute inset-0 bg-purple-500/20 rounded-md flex items-center justify-center">
                              <Play className="h-4 w-4 text-white" />
                            </div>
                          )}
                          {playedSongs.has(video.id) && !isCurrentlyPlaying && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                          )}
                          {/* Priority badge */}
                          <div className="absolute -top-1 -left-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate transition-colors duration-300 ${
                            isCurrentlyPlaying ? 'text-white' : 
                            playedSongs.has(video.id) ? 'text-gray-400' : 'text-white group-hover:text-purple-300'
                          }`}>
                            {video.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            <span className="font-bold text-purple-400">{video.upvotes} votes</span>
                            {playedSongs.has(video.id) && <span className="text-yellow-400"> • Played</span>}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant={video.haveUpvoted ? "secondary" : "outline"}
                            size="icon"
                            className={`h-8 w-8 transition-all duration-300 hover:scale-110 ${
                              video.haveUpvoted 
                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                : 'border-gray-600 text-gray-300 hover:border-purple-500 hover:text-purple-400'
                            }`}
                            onClick={e => {
                              e.stopPropagation();
                              toggleVote(video.id, video.haveUpvoted);
                            }}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-purple-400 font-bold min-w-[1.5rem] text-center">
                            {video.upvotes}
                          </span>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110"
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(video.id);
                            }}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {queue.length === 0 && (
                    <div className="text-center py-8">
                      <Music className="h-12 w-12 text-gray-500 mx-auto mb-3 animate-pulse" />
                      <p className="text-gray-400">Your queue is empty</p>
                      <p className="text-gray-500 text-sm mt-1">Add some videos to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.8);
        }
      `}</style>
    </div>
  );
}