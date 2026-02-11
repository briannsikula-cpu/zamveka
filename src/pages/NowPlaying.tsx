import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MoreVertical, Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat, Repeat1, Music } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import { useSongLike } from "@/hooks/useSongLike";
import { useState, useEffect } from "react";
import { SongOptionsSheet } from "@/components/SongOptionsSheet";
import { supabase } from "@/integrations/supabase/client";

const formatTime = (time: number) => {
  const m = Math.floor(time / 60);
  const s = Math.floor(time % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// Parse simple timed lyrics format: "[mm:ss] lyric line"
const parseLyrics = (raw: string): { time: number; text: string }[] => {
  const lines = raw.split("\n").filter(Boolean);
  const parsed: { time: number; text: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^\[(\d+):(\d+)\]\s*(.*)/);
    if (match) {
      const mins = parseInt(match[1]);
      const secs = parseInt(match[2]);
      parsed.push({ time: mins * 60 + secs, text: match[3] });
    } else {
      // Untimed lyric line — assign time -1
      parsed.push({ time: -1, text: line });
    }
  }
  return parsed;
};

const getCurrentLyricIndex = (lyrics: { time: number; text: string }[], currentTime: number): number => {
  const timed = lyrics.filter((l) => l.time >= 0);
  if (timed.length === 0) return -1;
  let idx = -1;
  for (let i = 0; i < timed.length; i++) {
    if (currentTime >= timed[i].time) idx = i;
  }
  return idx;
};

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
  const [lyrics, setLyrics] = useState<string | null>(null);

  useEffect(() => {
    if (currentSong?.id) {
      supabase
        .from("songs")
        .select("lyrics")
        .eq("id", currentSong.id)
        .single()
        .then(({ data }) => {
          setLyrics(data?.lyrics || null);
        });
    }
  }, [currentSong?.id]);

  if (!currentSong) {
    navigate("/");
    return null;
  }

  const parsedLyrics = lyrics ? parseLyrics(lyrics) : [];
  const hasTimed = parsedLyrics.some((l) => l.time >= 0);
  const currentLyricIdx = hasTimed ? getCurrentLyricIndex(parsedLyrics.filter(l => l.time >= 0), currentTime) : -1;
  const timedLyrics = parsedLyrics.filter(l => l.time >= 0);
  const currentLyricText = currentLyricIdx >= 0 ? timedLyrics[currentLyricIdx]?.text : null;

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
        <AnimatePresence mode="wait">
          {showLyrics ? (
            <motion.div
              key="lyrics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={() => setShowLyrics(false)}
              className="w-full max-w-sm h-[360px] rounded-xl overflow-hidden bg-card/80 backdrop-blur-md border border-border/20 p-6 flex flex-col cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Lyrics</h3>
                <span className="text-xs text-muted-foreground">Tap to show cover</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {lyrics ? (
                  <div className="space-y-2">
                    {parsedLyrics.map((line, i) => {
                      const isTimedActive = hasTimed && line.time >= 0 && timedLyrics[currentLyricIdx]?.text === line.text;
                      return (
                        <p
                          key={i}
                          className={`text-sm leading-relaxed transition-all duration-300 ${
                            isTimedActive
                              ? "text-foreground font-semibold scale-105 origin-left"
                              : "text-muted-foreground"
                          }`}
                        >
                          {line.text}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Lyrics not available for this track.</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cover"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={() => setShowLyrics(true)}
              className="w-full max-w-sm aspect-square rounded-xl overflow-hidden shadow-2xl relative cursor-pointer"
            >
              {currentSong.cover_url ? (
                <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center">
                  <Play className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              {/* Mini lyrics popup at bottom of cover */}
              <AnimatePresence>
                {currentLyricText && !showLyrics && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    key={currentLyricText}
                    className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <Music className="w-3 h-3 text-primary shrink-0" />
                      <p className="text-sm font-medium text-foreground truncate">{currentLyricText}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tap hint */}
              {!currentLyricText && (
                <div className="absolute bottom-3 right-3 bg-background/70 backdrop-blur-sm rounded-full p-2">
                  <Music className="w-4 h-4 text-foreground" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
