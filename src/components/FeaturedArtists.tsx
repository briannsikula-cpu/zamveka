import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { ArtistCard } from "./ArtistCard";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Artist {
  id: string;
  name: string;
  image_url: string | null;
  genre: string | null;
  followers_count: number;
}

export const FeaturedArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    const { data, error } = await supabase
      .from('artists')
      .select('id, name, image_url, genre, followers_count')
      .order('followers_count', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching artists:', error);
    } else {
      setArtists(data || []);
    }
    setLoading(false);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <div className="gradient-button p-2.5 rounded-xl">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Artists</h2>
              <p className="text-sm text-muted-foreground">Rising stars from Malawi</p>
            </div>
          </div>
          
          <Link to="/artists">
            <motion.button
              whileHover={{ x: 5 }}
              className="flex items-center gap-1 text-primary text-sm font-medium"
            >
              View All <ChevronRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Artists Grid */}
        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
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
            className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8"
          >
            {artists.map((artist) => (
              <motion.div
                key={artist.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 },
                }}
              >
                <ArtistCard
                  id={artist.id}
                  name={artist.name}
                  imageUrl={artist.image_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                  verified={true}
                  followers={artist.followers_count}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
