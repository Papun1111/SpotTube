"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  CheckCircle2,
  Zap,
  Shield,
  ArrowRight,
  Music,
  Users,
  ThumbsUp,
  ThumbsDown,
  Play,
  Volume2,
  Star,
  Sparkles,
  Headphones,
  LogOut,
  LogIn
} from "lucide-react";

const Button = ({ children, className = "", variant = "default", size = "default", ...props }:any) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95";
  const variants = {
    default: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl",
    outline: "border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent backdrop-blur-sm",
    auth: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl",
    logout: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl"
  };
  const sizes = {
    default: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
    sm: "px-4 py-2 text-sm"
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      //@ts-ignore
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const Card = ({ children, className = "", ...props }:any) => (
  <motion.div
    whileHover={{ 
      scale: 1.05,
      rotateY: 5,
      z: 50
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-2xl hover:shadow-purple-500/25 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

const FloatingElements = () => {
  const elements = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
          }}
          animate={{
            y: [null, -20, 20],
            x: [null, -10, 10],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};

export default function SpotTubeLanding() {
  const [joinUrl, setJoinUrl] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const { data: session } = useSession();
  
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e:any) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleJoin = () => {
    if (!joinUrl) return;
    if (joinUrl.startsWith("/")) {
      // router.push(joinUrl);
    } else {
      window.location.href = joinUrl;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200
      }
    }
  };

  const features = [
    {
      icon: Users,
      title: "Live Streaming Rooms",
      desc: "Create private rooms and stream music with friends in real-time sync.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Music,
      title: "Universal Playback",
      desc: "Support for YouTube, Spotify, SoundCloud and more platforms.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: ThumbsUp,
      title: "Democratic Queue",
      desc: "Vote on tracks to shape the playlist together democratically.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Instant Sync",
      desc: "Zero-latency synchronization across all connected devices.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Premium Security",
      desc: "End-to-end encrypted rooms with advanced privacy controls.",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: Headphones,
      title: "HD Audio Quality",
      desc: "Crystal clear audio streaming with adaptive bitrate technology.",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, purple 0%, transparent 50%)`
          }}
        />
      </div>
      
      <FloatingElements />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 px-6 py-4 backdrop-blur-xl bg-black/20 border-b border-purple-500/20"
      >
        <div className="container mx-auto flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SpotTube
            </span>
          </motion.div>
          
          <nav className="hidden md:flex space-x-8">
            {["Features", "Rooms", "Premium", "Support"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                whileHover={{ y: -2, color: "#a855f7" }}
                className="text-gray-300 hover:text-purple-400 transition-all duration-200"
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* Auth Button */}
          <div>
            {session?.user ? (
              <Button
                onClick={() => signOut()}
                variant="logout"
                size="sm"
                className="group"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Logout
              </Button>
            ) : (
              <Button
                onClick={() => signIn()}
                variant="auth"
                size="sm"
                className="group"
                aria-label="Sign in"
              >
                <LogIn className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      <main className="relative z-10">
        {/* Hero Section */}
        <motion.section
          style={{ y: heroY, opacity: heroOpacity }}
          className="min-h-screen flex items-center justify-center px-6"
        >
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-500/30"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">
                    {session?.user ? `Welcome back, ${session.user.name || 'User'}!` : 'Now with AI-powered recommendations'}
                  </span>
                </motion.div>
                
                <motion.h1
                  variants={itemVariants}
                  className="text-5xl md:text-7xl font-extrabold leading-tight"
                >
                  <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    Stream Music
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Together
                  </span>
                </motion.h1>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-xl text-gray-300 max-w-xl leading-relaxed"
              >
                Experience music like never before. Create rooms, invite friends, and control the vibe together with real-time voting and synchronized playback.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="flex flex-1 max-w-md">
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    placeholder="Enter room code or URL..."
                    value={joinUrl}
                    onChange={(e) => setJoinUrl(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-l-xl bg-gray-900/80 backdrop-blur-sm border border-purple-500/30 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                  />
                  <Button
                    onClick={handleJoin}
                    className="rounded-l-none rounded-r-xl"
                  >
                    Join
                  </Button>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                {session?.user ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="group">
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="group"
                      onClick={() => signIn()}
                    >
                      Start Free Room
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button size="lg" variant="outline">
                      <Volume2 className="mr-2 w-5 h-5" />
                      Browse Rooms
                    </Button>
                  </>
                )}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-center space-x-6 pt-4"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-black" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">50k+ active users</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-400 ml-2">4.9/5 rating</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-full h-96 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl backdrop-blur-xl border border-purple-500/30 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Play className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-48 mx-auto" />
                      <div className="h-2 bg-gray-700 rounded-full w-32 mx-auto" />
                    </div>
                    <p className="text-gray-400">Now Playing: Your Favorite Track</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating Elements around Hero Image */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center"
              >
                <ThumbsUp className="w-6 h-6 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center"
              >
                <Users className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-24 px-6"
        >
          <div className="container mx-auto">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Powerful Features
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need for the ultimate collaborative music streaming experience
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  custom={idx}
                >
                  <Card className="p-8 text-center h-full hover:border-purple-400/50 transition-all duration-300">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonial Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-24 px-6"
        >
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold">
                AJ
              </div>
              <blockquote className="text-2xl md:text-3xl font-light text-gray-200 leading-relaxed">
                "SpotTube transformed how my friends and I share music. The real-time sync is flawless, and the voting system keeps everyone engaged. It's like having a DJ booth in every room!"
              </blockquote>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-white">Alex Johnson</p>
                <p className="text-purple-400">Music Producer & DJ</p>
                <div className="flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-24 px-6"
        >
          <div className="container flex justify-center items-center text-center">
            <motion.div
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-12 border border-purple-500/30"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Get the Party Started?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of music lovers already streaming together. Create your first room in seconds.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {session?.user ? (
                  <Link href="/dashboard">
                    <Button size="sm" className="text-xl px-12 py-6">
                      <Play className="mr-3 w-6 h-6" />
                      Go to Dashboard
                      <ArrowRight className="ml-3 w-6 h-6" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="lg" 
                    className="text-xl px-12 py-6"
                    onClick={() => signIn()}
                  >
                    <Play className="mr-3 w-6 h-6" />
                    Start Your Room Now
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                )}
              </motion.div>
              <p className="text-sm text-gray-500 mt-4">
                {session?.user ? 'Welcome back! Your rooms are waiting.' : 'Free forever • No credit card required'}
              </p>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="border-t border-purple-500/20 py-12 px-6 bg-black/40 backdrop-blur-xl"
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                SpotTube
              </span>
            </div>
            
            <p className="text-gray-400">
              © {new Date().getFullYear()} SpotTube. Streaming the future of music together.
            </p>
            
            <div className="flex items-center space-x-6">
              {[Music, Users, Volume2].map((Icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, color: "#a855f7" }}
                  className="text-gray-400 hover:text-purple-400 cursor-pointer transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
