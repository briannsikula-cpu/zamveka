import { motion } from "framer-motion";
import { ChevronDown, MoreVertical, Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Volume2, Repeat, Repeat1, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSongLike } from "@/hooks/useSongLike";
import { useState } from "react";
import { SongOptionsSheet } from "@/components/SongOptionsSheet";

const formatTime = (time: number) => {
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// Simple placeholder lyrics when no real lyrics available
const placeholderLyrics = "Lyrics not available for this track.\n\nLyrics will appear here when available.";

export default function NowPlaying() {
  const navigate = useNavigate();
  const {
    currentSong, isPlaying, currentTime, duration,
    togglePlay, seek, playNext, playPrevious,
    shuffle, repeatMode, toggleShuffle, cycleRepeat,
  } = usePlayer();
  const { isLiked, toggleLike } = useSongLike(currentSong?.id || "");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentSong) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Playing from artist</p>
          <p className="text-xs font-semibold">{currentSong.artists?.name || "Unknown"}</p>
        </div>
        <button onClick={() => setOptionsOpen(true)} className="p-2">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Cover Art / Lyrics toggle area */}
      <div className="flex-1 flex items-center justify-center px-8 py-6 relative">
        {showLyrics ? (
          <motion.div
            key="lyrics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm h-[360px] rounded-xl overflow-hidden bg-card/80 backdrop-blur-md border border-border/20 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Lyrics</h3>
              <button
                onClick={() => setShowLyrics(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Show Cover
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {placeholderLyrics}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cover"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm aspect-square rounded-xl overflow-hidden shadow-2xl relative group"
          >
            {currentSong.cover_url ? (
              <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center">
                <Play className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
            {/* Lyrics button overlay */}
            <button
              onClick={() => setShowLyrics(true)}
              className="absolute bottom-3 right-3 bg-background/70 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Music className="w-4 h-4 text-foreground" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Song Info + Controls */}
      <div className="px-6 pb-8">
        {/* Title & Like */}
        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold truncate">{currentSong.title}</h2>
            <p className="text-sm text-muted-foreground truncate">{currentSong.artists?.name || "Unknown"}</p>
          </div>
          <button
            onClick={toggleLike}
            className={`p-2 ${isLiked ? "text-primary" : "text-muted-foreground"}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
            <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${shuffle ? "text-primary" : "text-muted-foreground"}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button onClick={playPrevious} className="p-2">
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
          </button>
          <button onClick={playNext} className="p-2">
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
          <button
            onClick={cycleRepeat}
            className={`p-2 transition-colors ${repeatMode !== "off" ? "text-primary" : "text-muted-foreground"}`}
          >
            {repeatMode === "one" ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <SongOptionsSheet song={currentSong} open={optionsOpen} onClose={() => setOptionsOpen(false)} />
    </div>
  );
}
