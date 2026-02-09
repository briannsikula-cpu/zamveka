import { Play, Pause, Heart } from "lucide-react";
import { useSongLike } from "@/hooks/useSongLike";
import { useNavigate } from "react-router-dom";

interface MiniPlayerSong {
  id: string;
  title: string;
  file_url: string;
  cover_url: string | null;
  artists?: { name: string; id: string; image_url?: string | null } | null;
}

interface MiniPlayerProps {
  song: MiniPlayerSong;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const MiniPlayer = ({ song, isPlaying, onTogglePlay }: MiniPlayerProps) => {
  const { isLiked, toggleLike } = useSongLike(song.id);
  const navigate = useNavigate();

  return (
    <div
      className="fixed bottom-[52px] left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border/20 px-3 py-2 cursor-pointer"
      onClick={() => navigate("/now-playing")}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {/* Cover */}
        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {song.cover_url ? (
            <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <Play className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{song.title}</p>
          <p className="text-xs text-muted-foreground truncate">{song.artists?.name || "Unknown"}</p>
        </div>

        {/* Actions */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(); }}
          className={`p-2 ${isLiked ? "text-primary" : "text-muted-foreground"}`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
          className="p-2 text-foreground"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>
      </div>
    </div>
  );
};
