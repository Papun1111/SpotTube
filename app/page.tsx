"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Redirect from "@/component/Redirect";
import {
  CheckCircle2,
  Zap,
  Shield,
  ArrowRight,
  Music,
  Users,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Appbar from "@/component/Appbar";

export default function Home() {
  const [joinUrl, setJoinUrl] = useState("");
  const router = useRouter();

  const handleJoin = () => {
    if (!joinUrl) return;
    // internal vs external
    if (joinUrl.startsWith("/")) {
      router.push(joinUrl);
    } else {
      window.location.href = joinUrl;
    }
  };

  return (
    <div
      className="
        bg-gradient-to-b from-[#000000] to-[#2a2a2a]
        text-gray-100 min-h-screen flex flex-col
      "
    >
      <Appbar />
      <Redirect />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-16 bg-transparent">
          <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold">
                GrooveTogether
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-lg">
                Create music rooms, add YouTube links, and jam with friends. Vote tracks up or down to control the playlist live.
              </p>

              {/* Join Input + Button */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste or type room URL"
                  value={joinUrl}
                  onChange={(e) => setJoinUrl(e.target.value)}
                  className="
                    flex-1 p-3 rounded-md
                    bg-[#1f1f1f] border border-[#3a3a3a]
                    text-gray-100 placeholder-gray-500
                    focus:outline-none focus:border-purple-500
                  "
                />
                <Button
                  onClick={handleJoin}
                  className="
                    px-6 py-3 rounded-md
                    bg-[#444444] hover:bg-[#555555]
                    text-gray-100
                  "
                >
                  Join
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-500">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-gray-600 text-gray-100">
                  Explore Rooms
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/music-hero.svg"
                alt="Music Rooms"
                width={500}
                height={500}
                className="rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Collaborative Rooms",
                  desc: "Invite friends to join your music room in real-time.",
                },
                {
                  icon: Music,
                  title: "Add & Share Links",
                  desc: "Drop YouTube or Spotify links and build your playlist.",
                },
                {
                  icon: ThumbsUp,
                  title: "Vote Up",
                  desc: "Upvote tracks to boost them in the queue.",
                },
                {
                  icon: ThumbsDown,
                  title: "Vote Down",
                  desc: "Downvote tracks to demote them in the queue.",
                },
                {
                  icon: Zap,
                  title: "Live Sync",
                  desc: "Synchronized playback for all participants.",
                },
                {
                  icon: Shield,
                  title: "Secure Sessions",
                  desc: "Rooms are private and protected by invite links.",
                },
              ].map((feature, idx) => (
                <Card
                  key={idx}
                  className="flex flex-col items-center text-center p-6 bg-[#1f1f1f] rounded-2xl"
                >
                  <div className="p-4 mb-4 rounded-full bg-purple-600">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section id="about" className="w-full py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center">
            <Image
              src="/user-testimonial.jpg"
              alt="Happy User"
              width={96}
              height={96}
              className="mx-auto rounded-full mb-6"
            />
            <blockquote className="text-xl italic text-gray-200">
              "GrooveTogether makes remote music sessions feel like we're all in the same room. The voting queue is so intuitive and fun!"
            </blockquote>
            <p className="mt-4 font-semibold text-gray-100">Alex Johnson</p>
            <p className="text-sm text-gray-400">Music Enthusiast</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-100">
              Ready to Jam?
            </h2>
            <p className="text-gray-300 mb-6">
              Start your free room and get your friends grooving together.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-500">
                Start Your Jam Session <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#3a3a3a] py-6 bg-[#1f1f1f]">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between text-gray-400">
          <p className="text-sm">© {new Date().getFullYear()} GrooveTogether</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-gray-100">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#" className="hover:text-gray-100">
              <Users className="h-5 w-5" />
            </Link>
            <Link href="#" className="hover:text-gray-100">
              <Music className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
