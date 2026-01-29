import { Play, Heart, Download } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "./ui/GlassCard";

interface TrackCardProps {
  title: string;
  artist: string;
  imageUrl: string;
  plays?: string;
  duration?: string;
}

export const TrackCard = ({ title, artist, imageUrl, plays, duration }: TrackCardProps) => {
  return (
    <GlassCard className="p-0 overflow-hidden group cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          className="absolute bottom-4 right-4 gradient-button p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
        >
          <Play className="w-5 h-5 fill-current" />
        </motion.button>

        {/* Duration Badge */}
        {duration && (
          <span className="absolute top-3 right-3 glass-card text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {duration}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground truncate mt-1">{artist}</p>
        
        {/* Stats & Actions */}
        <div className="flex items-center justify-between mt-3">
          {plays && (
            <span className="text-xs text-muted-foreground">{plays} plays</span>
          )}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <Heart className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="text-muted-foreground hover:text-secondary transition-colors"
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
