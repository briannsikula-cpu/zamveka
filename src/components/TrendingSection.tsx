import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import { TrackCard } from "./TrackCard";
import { EmptyState } from "./EmptyState";
import { Link } from "react-router-dom";

// This will be replaced with actual data from database when tracks are uploaded
const trendingTracks: Array<{
  id: number;
  title: string;
  artist: string;
  imageUrl: string;
  plays?: string;
  duration?: string;
}> = [];

export const TrendingSection = () => {
  const isEmpty = trendingTracks.length === 0;

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
        {isEmpty ? (
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
            {trendingTracks.map((track) => (
              <motion.div
                key={track.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <TrackCard {...track} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};
