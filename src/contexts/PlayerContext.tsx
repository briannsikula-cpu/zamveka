import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from "react";

export type RepeatMode = "off" | "one" | "all";

export interface PlayerSong {
  id: string;
  title: string;
  file_url: string;
  cover_url: string | null;
  plays_count?: number;
  likes_count?: number;
  genre?: string | null;
  artists?: { name: string; id: string; image_url?: string | null } | null;
}

interface PlayerContextType {
  currentSong: PlayerSong | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playlist: PlayerSong[];
  queue: PlayerSong[];
  shuffle: boolean;
  repeatMode: RepeatMode;
  playSong: (song: PlayerSong, playlist?: PlayerSong[]) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  closeSong: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (song: PlayerSong) => void;
  playNextInQueue: (song: PlayerSong) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<PlayerSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [playlist, setPlaylist] = useState<PlayerSong[]>([]);
  const [queue, setQueue] = useState<PlayerSong[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const getNextSong = useCallback(() => {
    if (!currentSong) return null;

    // Queue takes priority
    if (queue.length > 0) {
      return queue[0];
    }

    if (repeatMode === "one") return currentSong;

    if (playlist.length === 0) return null;

    const idx = playlist.findIndex((s) => s.id === currentSong.id);

    if (shuffle) {
      const others = playlist.filter((s) => s.id !== currentSong.id);
      return others.length > 0 ? others[Math.floor(Math.random() * others.length)] : null;
    }

    if (idx < playlist.length - 1) return playlist[idx + 1];
    if (repeatMode === "all") return playlist[0];
    return null;
  }, [currentSong, playlist, queue, shuffle, repeatMode]);

  const playSongInternal = useCallback((song: PlayerSong, pl?: PlayerSong[]) => {
    if (pl) setPlaylist(pl);
    setCurrentSong(song);
    if (audioRef.current) {
      audioRef.current.src = song.file_url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
    const audio = audioRef.current;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => {
      const next = getNextSong();
      if (next) {
        // If it came from the queue, remove it
        if (queue.length > 0 && queue[0].id === next.id) {
          setQueue((q) => q.slice(1));
        }
        playSongInternal(next);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [currentSong, playlist, queue, getNextSong, playSongInternal]);

  const playSong = useCallback((song: PlayerSong, pl?: PlayerSong[]) => {
    playSongInternal(song, pl);
  }, [playSongInternal]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const playNext = useCallback(() => {
    const next = getNextSong();
    if (next) {
      if (queue.length > 0 && queue[0].id === next.id) {
        setQueue((q) => q.slice(1));
      }
      playSongInternal(next);
    }
  }, [getNextSong, queue, playSongInternal]);

  const playPrevious = useCallback(() => {
    if (!currentSong || playlist.length === 0) return;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    if (idx > 0) playSongInternal(playlist[idx - 1]);
    else if (repeatMode === "all") playSongInternal(playlist[playlist.length - 1]);
  }, [currentSong, playlist, repeatMode, playSongInternal]);

  const closeSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  const addToQueue = useCallback((song: PlayerSong) => {
    setQueue((q) => [...q, song]);
  }, []);

  const playNextInQueue = useCallback((song: PlayerSong) => {
    setQueue((q) => [song, ...q]);
  }, []);

  const clearQueue = useCallback(() => setQueue([]), []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong, isPlaying, currentTime, duration, volume, playlist, queue,
        shuffle, repeatMode,
        playSong, togglePlay, seek, setVolume, playNext, playPrevious, closeSong,
        toggleShuffle, cycleRepeat, addToQueue, playNextInQueue, clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};
