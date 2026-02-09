import { motion, AnimatePresence } from "framer-motion";
import { Share2, Heart, ListPlus, User, Download, X } from "lucide-react";
import { useSongLike } from "@/hooks/useSongLike";
import { Link } from "react-router-dom";

interface SongOptionsSheetProps {
  song: {
    id: string;
    title: string;
    cover_url: string | null;
    file_url: string;
    artists?: { name: string; id: string; image_url?: string | null } | null;
  } | null;
  open: boolean;
  onClose: () => void;
}

export const SongOptionsSheet = ({ song, open, onClose }: SongOptionsSheetProps) => {
  const { isLiked, toggleLike } = useSongLike(song?.id || "");

  if (!song) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = song.file_url;
    link.download = `${song.title}.mp3`;
    link.click();
    onClose();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: song.title, url: window.location.href });
    }
    onClose();
  };

  const options = [
    { icon: Share2, label: "Share", onClick: handleShare },
    { icon: Heart, label: isLiked ? "Remove from Liked Songs" : "Add to Liked Songs", onClick: () => { toggleLike(); onClose(); } },
    { icon: Download, label: "Download", onClick: handleDownload },
    ...(song.artists ? [{ icon: User, label: `Go to artist`, onClick: () => {}, link: `/artist/${song.artists.id}` }] : []),
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl max-h-[80vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Song header */}
            <div className="flex items-center gap-3 px-5 pb-4 border-b border-border/20">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {song.cover_url ? (
                  <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{song.title}</p>
                <p className="text-sm text-muted-foreground truncate">{song.artists?.name || "Unknown"}</p>
              </div>
            </div>

            {/* Options */}
            <div className="py-2">
              {options.map((option, i) => {
                const content = (
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <option.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                );

                if ('link' in option && option.link) {
                  return (
                    <Link key={i} to={option.link} onClick={onClose}>
                      {content}
                    </Link>
                  );
                }

                return (
                  <div key={i} onClick={option.onClick}>
                    {content}
                  </div>
                );
              })}
            </div>

            {/* Close */}
            <div className="px-5 pb-6 pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-muted text-sm font-medium text-center"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
