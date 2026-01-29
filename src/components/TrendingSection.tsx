import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import { TrackCard } from "./TrackCard";
import { Link } from "react-router-dom";

const trendingTracks = [
  {
    id: 1,
    title: "Against the Odds",
    artist: "Zeidah",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    plays: "125K",
    duration: "3:42",
  },
  {
    id: 2,
    title: "Midnight Dreams",
    artist: "Eli Njuchi",
    imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400",
    plays: "98K",
    duration: "4:15",
  },
  {
    id: 3,
    title: "Rise Up",
    artist: "Patience Namadingo",
    imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400",
    plays: "87K",
    duration: "3:58",
  },
  {
    id: 4,
    title: "Lilongwe Nights",
    artist: "Suffix",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    plays: "76K",
    duration: "3:22",
  },
  {
    id: 5,
    title: "Golden Hour",
    artist: "Gwamba",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    plays: "65K",
    duration: "4:01",
  },
  {
    id: 6,
    title: "African Sunrise",
    artist: "Sangie",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400",
    plays: "54K",
    duration: "3:35",
  },
];

export const TrendingSection = () => {
  return (
    <section className="py-16 relative">
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
          
          <Link to="/trending">
            <motion.button
              whileHover={{ x: 5 }}
              className="flex items-center gap-1 text-primary text-sm font-medium"
            >
              View All <ChevronRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
        >
          {trendingTracks.map((track, i) => (
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
      </div>
    </section>
  );
};
