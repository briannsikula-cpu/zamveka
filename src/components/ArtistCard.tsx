import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ArtistCardProps {
  name: string;
  imageUrl: string;
  verified?: boolean;
  followers?: string;
}

export const ArtistCard = ({ name, imageUrl, verified, followers }: ArtistCardProps) => {
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
        {followers && (
          <p className="text-xs text-muted-foreground mt-0.5">{followers} followers</p>
        )}
      </div>
    </motion.div>
  );
};
