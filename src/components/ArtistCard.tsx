import { motion } from "framer-motion";
import { BadgeCheck, UserPlus, UserCheck } from "lucide-react";
import { useFollowArtist } from "@/hooks/useFollowArtist";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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
    toggleFollow();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group cursor-pointer"
    >
      {/* Image Container - Spotify-style square card */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
        />
        
        {/* Follow Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.1 }}
          onClick={handleFollowClick}
          disabled={isLoading}
          className={`absolute bottom-2 right-2 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg ${
            isFollowing 
              ? 'bg-primary text-primary-foreground' 
              : 'gradient-button'
          }`}
        >
          {isFollowing ? (
            <UserCheck className="w-5 h-5" />
          ) : (
            <UserPlus className="w-5 h-5" />
          )}
        </motion.button>

        {/* Verified Badge */}
        {verified && (
          <div className="absolute top-2 right-2">
            <BadgeCheck className="w-5 h-5 text-secondary fill-secondary/20" />
          </div>
        )}
      </div>

      {/* Info - Clean minimal style */}
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-sm flex items-center gap-1">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {formatFollowers(followers)} followers
        </p>
      </div>
    </motion.div>
  );
};
