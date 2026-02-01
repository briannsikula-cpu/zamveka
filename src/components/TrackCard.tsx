import { Play, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface TrackCardProps {
  title: string;
  artist: string;
  imageUrl: string;
  plays?: string;
  duration?: string;
}

export const TrackCard = ({ title, artist, imageUrl, plays, duration }: TrackCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer"
    >
      {/* Image Container - Spotify-style square card */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
        />
        
        {/* Play Button - Spotify style */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.1 }}
          className="absolute bottom-2 right-2 gradient-button p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
        >
          <Play className="w-5 h-5 fill-current" />
        </motion.button>

        {/* Duration Badge */}
        {duration && (
          <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {duration}
          </span>
        )}
        
        {/* Like Button */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 left-2 text-foreground/80 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
        >
          <Heart className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Info - Clean minimal style */}
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-sm">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{artist}</p>
        {plays && (
          <p className="text-xs text-muted-foreground">{plays} plays</p>
        )}
      </div>
    </motion.div>
  );
};
