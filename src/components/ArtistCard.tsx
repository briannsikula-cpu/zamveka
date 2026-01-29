import { motion } from "framer-motion";
import { Check, UserPlus, UserCheck } from "lucide-react";
import { useFollowArtist } from "@/hooks/useFollowArtist";

interface ArtistCardProps {
  id: string;
  name: string;
  imageUrl: string;
  verified?: boolean;
  followers?: number;
}

export const ArtistCard = ({ id, name, imageUrl, verified, followers }: ArtistCardProps) => {
  const { isFollowing, isLoading, toggleFollow } = useFollowArtist(id);

  const formatFollowers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="flex flex-col items-center gap-3 cursor-pointer group"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all duration-300">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        {verified && (
          <div className="absolute bottom-1 right-1 gradient-button p-1.5 rounded-full">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        {followers !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatFollowers(followers)} followers
          </p>
        )}
      </div>

      {/* Follow Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          toggleFollow();
        }}
        disabled={isLoading}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
          isFollowing
            ? "bg-primary/20 text-primary border border-primary/30"
            : "gradient-button text-white"
        }`}
      >
        {isFollowing ? (
          <>
            <UserCheck className="w-3.5 h-3.5" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-3.5 h-3.5" />
            Follow
          </>
        )}
      </motion.button>
    </motion.div>
  );
};
