import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, UserPlus, UserCheck, Sparkles } from "lucide-react";
import { useFollowArtist } from "@/hooks/useFollowArtist";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface ArtistCardProps {
  id: string;
  name: string;
  imageUrl: string;
  verified?: boolean;
  followers?: number;
}

export const ArtistCard = ({ id, name, imageUrl, verified, followers = 0 }: ArtistCardProps) => {
  const { isFollowing, isLoading, toggleFollow } = useFollowArtist(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showRipple, setShowRipple] = useState(false);
  const [justClicked, setJustClicked] = useState(false);

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setShowRipple(true);
    setJustClicked(true);
    setTimeout(() => setShowRipple(false), 600);
    setTimeout(() => setJustClicked(false), 400);
    
    toggleFollow();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/artist/${id}`)}
    >
      {/* Image Container - Enhanced glass card */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-3 glass-card">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Follow Button with animations */}
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFollowClick}
          disabled={isLoading}
          className={`absolute bottom-3 right-3 p-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl overflow-hidden ${
            isFollowing 
              ? 'bg-primary text-primary-foreground shadow-primary/50' 
              : 'gradient-button'
          } ${justClicked ? 'animate-button-pop' : ''}`}
          style={{ boxShadow: isFollowing ? 'var(--glow-primary)' : undefined }}
        >
          {/* Ripple effect */}
          <AnimatePresence>
            {showRipple && (
              <motion.span
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-white/30 rounded-full"
              />
            )}
          </AnimatePresence>
          
          <motion.div
            key={isFollowing ? 'following' : 'not-following'}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            {isFollowing ? (
              <UserCheck className="w-5 h-5 relative z-10" />
            ) : (
              <UserPlus className="w-5 h-5 relative z-10" />
            )}
          </motion.div>
        </motion.button>

        {/* Verified Badge with glow */}
        {verified && (
          <motion.div 
            className="absolute top-3 right-3"
            animate={{ 
              filter: ['drop-shadow(0 0 4px hsl(var(--secondary)))', 'drop-shadow(0 0 12px hsl(var(--secondary)))', 'drop-shadow(0 0 4px hsl(var(--secondary)))']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BadgeCheck className="w-6 h-6 text-secondary fill-secondary/30" />
          </motion.div>
        )}

        {/* Sparkle effects on hover */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            className="absolute top-1/4 left-1/4"
          >
            <Sparkles className="w-3 h-3 text-primary" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute top-1/3 right-1/3"
          >
            <Sparkles className="w-2 h-2 text-secondary" />
          </motion.div>
        </div>
      </div>

      {/* Info - Enhanced typography */}
      <div className="space-y-1 px-1">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300 text-sm flex items-center gap-1">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
          {formatFollowers(followers)} followers
        </p>
      </div>
    </motion.div>
  );
};
