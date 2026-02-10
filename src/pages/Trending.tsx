import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrendingUp, Play } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";
import { SongCard } from "@/components/SongCard";
import { MiniPlayer } from "@/components/MiniPlayer";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/contexts/PlayerContext";

interface Song {
  id: string;
  title: string;
  file_url: string;
  cover_url: string | null;
  plays_count: number;
  likes_count: number;
  genre: string | null;
  artists: { id: string; name: string; image_url: string | null } | null;
}

export default function Trending() {
  const { user } = useAuth();
  const { currentSong, isPlaying, togglePlay, playSong } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    const { data } = await supabase
      .from("songs")
      .select("*, artists(id, name, image_url)")
      .order("plays_count", { ascending: false })
      .limit(20);

    setSongs((data as Song[]) || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-32">
      <Header />

      <main className="pt-28 pb-10">
        {/* Hero Banner */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-primary/25 blur-[150px]"
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="gradient-button p-4 rounded-2xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Trending Now</h1>
                  <p className="text-muted-foreground">The hottest tracks this week</p>
                </div>
              </div>

              {songs.length > 0 && (
                <GradientButton
                  icon={<Play className="w-5 h-5 fill-current" />}
                  onClick={() => playSong(songs[0] as any, songs as any)}
                >
                  Play All
                </GradientButton>
              )}
            </motion.div>
          </div>
        </section>

        {/* Songs List */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : songs.length === 0 ? (
              <div className="text-center py-16">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No songs uploaded yet. Be the first artist to share your music!</p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-3"
              >
                {songs.map((song) => (
                  <motion.div
                    key={song.id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <SongCard
                      song={song as any}
                      isPlaying={currentSong?.id === song.id && isPlaying}
                      onPlay={() => playSong(song as any, songs as any)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {currentSong && (
        <MiniPlayer song={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} />
      )}
      <BottomNav />
    </div>
  );
}
