import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import { TrackCard } from "./TrackCard";
import { EmptyState } from "./EmptyState";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TrendingSong {
  id: string;
  title: string;
  cover_url: string | null;
  plays_count: number;
  artists: { name: string } | null;
}

export const TrendingSection = () => {
  const [songs, setSongs] = useState<TrendingSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    const { data } = await supabase
      .from("songs")
      .select("id, title, cover_url, plays_count, artists(name)")
      .order("plays_count", { ascending: false })
      .limit(12);
    setSongs((data as TrendingSong[]) || []);
    setLoading(false);
  };

  const isEmpty = !loading && songs.length === 0;

  return (
    <section className="py-12 relative">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="gradient-button p-2.5 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Trending Now</h2>
              <p className="text-sm text-muted-foreground">Top tracks this week</p>
            </div>
          </div>
          
          {!isEmpty && (
            <Link to="/trending">
              <motion.button
                whileHover={{ x: 5 }}
                className="flex items-center gap-1 text-primary text-sm font-medium"
              >
                View All <ChevronRight className="w-4 h-4" />
              </motion.button>
            </Link>
          )}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState type="tracks" />
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {songs.map((song) => (
              <motion.div
                key={song.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <TrackCard
                  title={song.title}
                  artist={song.artists?.name || "Unknown"}
                  imageUrl={song.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"}
                  plays={`${song.plays_count.toLocaleString()}`}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
