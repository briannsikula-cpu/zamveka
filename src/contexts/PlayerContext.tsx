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
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const getNextSong = useCallback(() => {
    if (!currentSong || playlist.length === 0) return null;
    if (repeatMode === "one") return currentSong;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    if (shuffle) {
      const others = playlist.filter((s) => s.id !== currentSong.id);
      return others.length > 0 ? others[Math.floor(Math.random() * others.length)] : null;
    }
    if (idx < playlist.length - 1) return playlist[idx + 1];
    if (repeatMode === "all") return playlist[0];
    return null;
  }, [currentSong, playlist, shuffle, repeatMode]);

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
        playSong(next, playlist);
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
  }, [currentSong, playlist, getNextSong]);

  const playSong = useCallback((song: PlayerSong, pl?: PlayerSong[]) => {
    if (pl) setPlaylist(pl);
    setCurrentSong(song);
    if (audioRef.current) {
      audioRef.current.src = song.file_url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

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
    if (!currentSong) return;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    if (idx < playlist.length - 1) playSong(playlist[idx + 1], playlist);
  }, [currentSong, playlist, playSong]);

  const playPrevious = useCallback(() => {
    if (!currentSong) return;
    const idx = playlist.findIndex((s) => s.id === currentSong.id);
    if (idx > 0) playSong(playlist[idx - 1], playlist);
  }, [currentSong, playlist, playSong]);

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

  return (
    <PlayerContext.Provider
      value={{
        currentSong, isPlaying, currentTime, duration, volume, playlist,
        shuffle, repeatMode,
        playSong, togglePlay, seek, setVolume, playNext, playPrevious, closeSong,
        toggleShuffle, cycleRepeat,
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
