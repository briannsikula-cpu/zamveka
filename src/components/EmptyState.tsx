import { motion } from "framer-motion";
import { Upload, Music, Mic2 } from "lucide-react";
import { Link } from "react-router-dom";
import { GradientButton } from "./ui/GradientButton";

interface EmptyStateProps {
  type: "tracks" | "artists";
}

export const EmptyState = ({ type }: EmptyStateProps) => {
  const config = {
    tracks: {
      icon: Music,
      title: "No tracks yet",
      description: "Be the first to share your music with the world",
      buttonText: "Upload Your Track",
      link: "/apply",
    },
    artists: {
      icon: Mic2,
      title: "No artists yet",
      description: "Join our community of talented artists",
      buttonText: "Become an Artist",
      link: "/apply",
    },
  };

  const { icon: Icon, title, description, buttonText, link } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
        />
        <div className="relative glass-card p-6 rounded-full">
          <Icon className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">{description}</p>
      
      <Link to={link}>
        <GradientButton icon={<Upload className="w-5 h-5" />}>
          {buttonText}
        </GradientButton>
      </Link>
    </motion.div>
  );
};
