import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { ArtistCard } from "./ArtistCard";
import { Link } from "react-router-dom";

const artists = [
  {
    id: 1,
    name: "Patience Namadingo",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    verified: true,
    followers: "45.2K",
  },
  {
    id: 2,
    name: "Eli Njuchi",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
    verified: true,
    followers: "38.1K",
  },
  {
    id: 3,
    name: "Gwamba",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    verified: true,
    followers: "32.5K",
  },
  {
    id: 4,
    name: "Sangie",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
    verified: true,
    followers: "28.9K",
  },
  {
    id: 5,
    name: "Suffix",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    verified: false,
    followers: "22.4K",
  },
  {
    id: 6,
    name: "Zeidah",
    imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
    verified: true,
    followers: "18.7K",
  },
];

export const FeaturedArtists = () => {
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
              <ArtistCard {...artist} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
