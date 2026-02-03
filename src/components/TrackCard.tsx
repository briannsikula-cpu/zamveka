import { Play, Heart, Pause, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface TrackCardProps {
  title: string;
  artist: string;
  imageUrl: string;
  plays?: string;
  duration?: string;
}

export const TrackCard = ({ title, artist, imageUrl, plays, duration }: TrackCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 600);
    }
    setIsLiked(!isLiked);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group cursor-pointer"
    >
      {/* Image Container - Enhanced glass card */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-3 glass-card">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Play Button with pulse animation */}
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePlayClick}
          className={`absolute bottom-3 right-3 gradient-button p-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl ${
            isPlaying ? 'animate-pulse-glow' : ''
          }`}
        >
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </motion.div>
        </motion.button>

        {/* Duration Badge with glass effect */}
        {duration && (
          <motion.span 
            initial={{ opacity: 0, x: 10 }}
            className="absolute top-3 right-3 glass-button text-xs px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            {duration}
          </motion.span>
        )}
        
        {/* Like Button with heart animation */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          onClick={handleLikeClick}
          className={`absolute top-3 left-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ${
            isLiked ? 'text-destructive' : 'text-foreground/80 hover:text-destructive'
          }`}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={isLiked ? 'animate-heart-beat' : ''}
          >
            <Heart className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'fill-current' : ''}`} />
          </motion.div>
          
          {/* Heart burst particles */}
          <AnimatePresence>
            {showHeartBurst && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      x: Math.cos(i * 60 * Math.PI / 180) * 20,
                      y: Math.sin(i * 60 * Math.PI / 180) * 20,
                      opacity: [1, 1, 0]
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-destructive rounded-full"
                    style={{ transform: 'translate(-50%, -50%)' }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            className="absolute top-1/4 right-1/4"
          >
            <Sparkles className="w-3 h-3 text-accent" />
          </motion.div>
        </div>
      </div>

      {/* Info - Enhanced typography */}
      <div className="space-y-1 px-1">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300 text-sm">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground truncate group-hover:text-muted-foreground/80 transition-colors">{artist}</p>
        {plays && (
          <p className="text-xs text-muted-foreground/70">{plays} plays</p>
        )}
      </div>
    </motion.div>
  );
};
