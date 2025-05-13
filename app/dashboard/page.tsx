"use client"

import { useState } from "react"
import { ArrowUpCircle, Music, ThumbsUp, ThumbsDown, Share2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface VideoItem {
  id: string
  title: string
  thumbnail: string
  votes: number
}

export default function Dashboard() {
  const [videoUrl, setVideoUrl] = useState("")
  const [videoId, setVideoId] = useState("")
  const [queue, setQueue] = useState<VideoItem[]>([
    {
      id: "dQw4w9WgXcQ",
      title: "Rick Astley - Never Gonna Give You Up",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      votes: 15,
    },
    {
      id: "9bZkp7q19f0",
      title: "PSY - GANGNAM STYLE",
      thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg",
      votes: 12,
    },
    {
      id: "kJQP7kiw5Fk",
      title: "Luis Fonsi - Despacito ft. Daddy Yankee",
      thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg",
      votes: 8,
    },
    {
      id: "JGwWNGJdvx8",
      title: "Ed Sheeran - Shape of You",
      thumbnail: "https://img.youtube.com/vi/JGwWNGJdvx8/mqdefault.jpg",
      votes: 6,
    },
  ])

  const currentlyPlaying = "dQw4w9WgXcQ"

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setVideoUrl(url)

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    if (match && match[2].length === 11) {
      setVideoId(match[2])
    } else {
      setVideoId("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoId || queue.some((item) => item.id === videoId)) return

    const newVideo: VideoItem = {
      id: videoId,
      title: "New Submitted Video",
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      votes: 1,
    }

    setQueue((prev) =>
      [...prev, newVideo].sort((a, b) => b.votes - a.votes)
    )
    setVideoUrl("")
    setVideoId("")
  }

  const handleUpvote = (id: string) => {
    setQueue((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, votes: item.votes + 1 } : item
        )
        .sort((a, b) => b.votes - a.votes)
    )
  }

  const handleDownvote = (id: string) => {
    setQueue((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, votes: item.votes - 1 } : item
        )
        .sort((a, b) => b.votes - a.votes)
    )
  }

  const handleShare = async () => {
    const shareData = {
      title: "StreamTunes Dashboard",
      text: "Check out what's playing right now on StreamTunes!",
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        alert("Link copied to clipboard!")
      }
    } catch (err) {
      console.error("Share failed:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container flex h-16 items-center px-4">
          <Link href="#" className="flex items-center gap-2 font-semibold">
            <Music className="h-6 w-6" />
            <span>StreamTunes</span>
          </Link>
          <nav className="ml-auto flex gap-4">
            <Button variant="ghost">Dashboard</Button>
            <Button variant="ghost">History</Button>
            <Button variant="ghost">Settings</Button>
            <Button
              variant="ghost"
              onClick={handleShare}
              aria-label="Share StreamTunes"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="container grid gap-6 px-4 py-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Now Playing</CardTitle>
              <CardDescription className="text-gray-400">
                Currently streaming to viewers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video overflow-hidden rounded-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentlyPlaying}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="aspect-video"
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Submit a Song</CardTitle>
                <CardDescription className="text-gray-400">
                  Paste a YouTube link to add it to the voting queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <Input
                      type="text"
                      placeholder="Paste YouTube URL here..."
                      value={videoUrl}
                      onChange={handleUrlChange}
                      className="flex-1 bg-gray-800 border-gray-700"
                    />
                    <Button type="submit" disabled={!videoId}>
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Submit
                    </Button>
                  </div>

                  {videoId && (
                    <div className="mt-2 rounded-lg overflow-hidden bg-gray-800 p-4 flex items-center gap-4">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-24 h-auto rounded"
                      />
                      <div>
                        <h3 className="font-medium">Video Preview</h3>
                        <p className="text-sm text-gray-400">
                          Click submit to add this to the queue
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="md:col-span-1">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Up Next</CardTitle>
              <CardDescription className="text-gray-400">
                Vote for the next song
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {queue.map((video) => (
                  <div key={video.id} className="flex gap-3 items-center">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleUpvote(video.id)}
                        aria-label="Upvote"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleDownvote(video.id)}
                        aria-label="Downvote"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-800/50 p-2 w-full">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="h-12 w-20 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {video.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {video.votes} votes
                        </p>
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
  )
}
