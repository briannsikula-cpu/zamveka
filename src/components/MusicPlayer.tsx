 import { useState, useRef, useEffect } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Play, Pause, Heart, Download, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
 import { useSongLike } from "@/hooks/useSongLike";
 
 interface Song {
   id: string;
   title: string;
   file_url: string;
   cover_url: string | null;
  plays_count?: number;
  likes_count?: number;
  genre?: string | null;
  artists?: { name: string; id: string; image_url?: string | null };
 }
 
interface MusicPlayerSong {
  id: string;
  title: string;
  file_url: string;
  cover_url: string | null;
  plays_count?: number;
  likes_count?: number;
  genre?: string | null;
  artists?: { name: string; id: string; image_url?: string | null } | null;
}

interface MusicPlayerProps {
  song: MusicPlayerSong | null;
   onClose: () => void;
  playlist?: MusicPlayerSong[];
  onSongChange?: (song: MusicPlayerSong) => void;
 }
 
 export const MusicPlayer = ({ song, onClose, playlist = [], onSongChange }: MusicPlayerProps) => {
   const audioRef = useRef<HTMLAudioElement>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [currentTime, setCurrentTime] = useState(0);
   const [duration, setDuration] = useState(0);
   const [volume, setVolume] = useState(1);
   const [isMuted, setIsMuted] = useState(false);
   
   const { isLiked, toggleLike } = useSongLike(song?.id || '');
 
   useEffect(() => {
     if (song && audioRef.current) {
       audioRef.current.src = song.file_url;
       audioRef.current.play();
       setIsPlaying(true);
     }
   }, [song]);
 
   useEffect(() => {
     const audio = audioRef.current;
     if (!audio) return;
 
     const updateTime = () => setCurrentTime(audio.currentTime);
     const updateDuration = () => setDuration(audio.duration);
     const handleEnded = () => {
       if (playlist.length > 0 && song) {
         const currentIndex = playlist.findIndex(s => s.id === song.id);
         if (currentIndex < playlist.length - 1 && onSongChange) {
           onSongChange(playlist[currentIndex + 1]);
         } else {
           setIsPlaying(false);
         }
       } else {
         setIsPlaying(false);
       }
     };
 
     audio.addEventListener('timeupdate', updateTime);
     audio.addEventListener('loadedmetadata', updateDuration);
     audio.addEventListener('ended', handleEnded);
 
     return () => {
       audio.removeEventListener('timeupdate', updateTime);
       audio.removeEventListener('loadedmetadata', updateDuration);
       audio.removeEventListener('ended', handleEnded);
     };
   }, [playlist, song, onSongChange]);
 
   const togglePlay = () => {
     if (audioRef.current) {
       if (isPlaying) {
         audioRef.current.pause();
       } else {
         audioRef.current.play();
       }
       setIsPlaying(!isPlaying);
     }
   };
 
   const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
     const time = parseFloat(e.target.value);
     if (audioRef.current) {
       audioRef.current.currentTime = time;
       setCurrentTime(time);
     }
   };
 
   const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const vol = parseFloat(e.target.value);
     setVolume(vol);
     if (audioRef.current) {
       audioRef.current.volume = vol;
     }
     setIsMuted(vol === 0);
   };
 
   const toggleMute = () => {
     if (audioRef.current) {
       audioRef.current.muted = !isMuted;
       setIsMuted(!isMuted);
     }
   };
 
   const handleDownload = () => {
     if (song) {
       const link = document.createElement('a');
       link.href = song.file_url;
       link.download = `${song.title}.mp3`;
       link.click();
     }
   };
 
   const formatTime = (time: number) => {
     const minutes = Math.floor(time / 60);
     const seconds = Math.floor(time % 60);
     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
   };
 
   const playPrevious = () => {
     if (playlist.length > 0 && song && onSongChange) {
       const currentIndex = playlist.findIndex(s => s.id === song.id);
       if (currentIndex > 0) {
         onSongChange(playlist[currentIndex - 1]);
       }
     }
   };
 
   const playNext = () => {
     if (playlist.length > 0 && song && onSongChange) {
       const currentIndex = playlist.findIndex(s => s.id === song.id);
       if (currentIndex < playlist.length - 1) {
         onSongChange(playlist[currentIndex + 1]);
       }
     }
   };
 
   if (!song) return null;
 
   return (
     <AnimatePresence>
       <motion.div
         initial={{ y: 100, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         exit={{ y: 100, opacity: 0 }}
         className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/30 p-4"
       >
         <audio ref={audioRef} />
         
         <div className="container mx-auto flex items-center gap-4">
           {/* Song Info */}
           <div className="flex items-center gap-3 min-w-0 flex-1">
             <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
               {song.cover_url ? (
                 <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                   <Play className="w-5 h-5 text-muted-foreground" />
                 </div>
               )}
             </div>
             <div className="min-w-0">
               <h4 className="font-medium truncate text-sm">{song.title}</h4>
               <p className="text-xs text-muted-foreground truncate">{song.artists?.name || 'Unknown Artist'}</p>
             </div>
           </div>
 
           {/* Controls */}
           <div className="flex flex-col items-center gap-2 flex-1">
             <div className="flex items-center gap-3">
               <button
                 onClick={playPrevious}
                 className="p-2 hover:bg-muted rounded-full transition-colors"
                 disabled={!playlist.length}
               >
                 <SkipBack className="w-4 h-4" />
               </button>
               
               <button
                 onClick={togglePlay}
                 className="p-3 gradient-button rounded-full"
               >
                 {isPlaying ? (
                   <Pause className="w-5 h-5 fill-current" />
                 ) : (
                   <Play className="w-5 h-5 fill-current ml-0.5" />
                 )}
               </button>
               
               <button
                 onClick={playNext}
                 className="p-2 hover:bg-muted rounded-full transition-colors"
                 disabled={!playlist.length}
               >
                 <SkipForward className="w-4 h-4" />
               </button>
             </div>
 
             {/* Progress Bar */}
             <div className="flex items-center gap-2 w-full max-w-md">
               <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
               <input
                 type="range"
                 min={0}
                 max={duration || 100}
                 value={currentTime}
                 onChange={handleSeek}
                 className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
               />
               <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
             </div>
           </div>
 
           {/* Actions */}
           <div className="flex items-center gap-2 flex-1 justify-end">
             <button
               onClick={toggleLike}
               className={`p-2 rounded-full transition-colors ${isLiked ? 'text-destructive' : 'hover:bg-muted'}`}
             >
               <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
             </button>
             
             <button onClick={handleDownload} className="p-2 hover:bg-muted rounded-full transition-colors">
               <Download className="w-5 h-5" />
             </button>
 
             {/* Volume */}
             <div className="hidden md:flex items-center gap-2">
               <button onClick={toggleMute} className="p-2 hover:bg-muted rounded-full transition-colors">
                 {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
               </button>
               <input
                 type="range"
                 min={0}
                 max={1}
                 step={0.1}
                 value={isMuted ? 0 : volume}
                 onChange={handleVolumeChange}
                 className="w-20 h-1 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
               />
             </div>
 
             <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors ml-2">
               <X className="w-5 h-5" />
             </button>
           </div>
         </div>
       </motion.div>
     </AnimatePresence>
   );
 };