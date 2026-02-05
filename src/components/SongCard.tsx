 import { motion } from "framer-motion";
 import { Play, Heart, Download, Pause } from "lucide-react";
 import { useSongLike } from "@/hooks/useSongLike";
 import { useFollowArtist } from "@/hooks/useFollowArtist";
 import { Link } from "react-router-dom";
 
 interface SongCardProps {
   song: {
     id: string;
     title: string;
     file_url: string;
     cover_url: string | null;
     plays_count: number;
     likes_count: number;
     genre: string | null;
     artists?: { id: string; name: string; image_url: string | null };
   };
   isPlaying?: boolean;
   onPlay: () => void;
 }
 
 export const SongCard = ({ song, isPlaying, onPlay }: SongCardProps) => {
   const { isLiked, toggleLike } = useSongLike(song.id);
   const { isFollowing, toggleFollow } = useFollowArtist(song.artists?.id || '');
 
   const handleDownload = (e: React.MouseEvent) => {
     e.stopPropagation();
     const link = document.createElement('a');
     link.href = song.file_url;
     link.download = `${song.title}.mp3`;
     link.click();
   };
 
   return (
     <motion.div
       whileHover={{ scale: 1.02 }}
       className="glass-card p-4 rounded-xl group"
     >
       <div className="flex items-center gap-4">
         {/* Cover */}
         <div 
           className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer"
           onClick={onPlay}
         >
           {song.cover_url ? (
             <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
               <Play className="w-6 h-6 text-muted-foreground" />
             </div>
           )}
           <motion.div
             initial={{ opacity: 0 }}
             whileHover={{ opacity: 1 }}
             className="absolute inset-0 bg-background/60 flex items-center justify-center"
           >
             {isPlaying ? (
               <Pause className="w-6 h-6 fill-current" />
             ) : (
               <Play className="w-6 h-6 fill-current ml-0.5" />
             )}
           </motion.div>
         </div>
 
         {/* Info */}
         <div className="flex-1 min-w-0">
           <h3 className="font-semibold truncate">{song.title}</h3>
           {song.artists && (
             <Link 
               to={`/artist/${song.artists.id}`}
               className="text-sm text-muted-foreground hover:text-primary transition-colors"
             >
               {song.artists.name}
             </Link>
           )}
           <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
             <span>{song.plays_count} plays</span>
             <span>{song.likes_count} likes</span>
             {song.genre && <span className="capitalize">{song.genre}</span>}
           </div>
         </div>
 
         {/* Actions */}
         <div className="flex items-center gap-2">
           <motion.button
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             onClick={(e) => { e.stopPropagation(); toggleLike(); }}
             className={`p-2 rounded-full transition-colors ${isLiked ? 'text-destructive' : 'hover:bg-muted'}`}
           >
             <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
           </motion.button>
           
           <motion.button
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
             onClick={handleDownload}
             className="p-2 hover:bg-muted rounded-full transition-colors"
           >
             <Download className="w-5 h-5" />
           </motion.button>
 
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={onPlay}
             className="gradient-button p-2.5 rounded-full"
           >
             {isPlaying ? (
               <Pause className="w-4 h-4 fill-current" />
             ) : (
               <Play className="w-4 h-4 fill-current ml-0.5" />
             )}
           </motion.button>
         </div>
       </div>
 
       {/* Follow Artist */}
       {song.artists && (
         <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
               {song.artists.image_url ? (
                 <img src={song.artists.image_url} alt={song.artists.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
               )}
             </div>
             <span className="text-sm text-muted-foreground">{song.artists.name}</span>
           </div>
           <button
             onClick={(e) => { e.stopPropagation(); toggleFollow(); }}
             className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
               isFollowing 
                 ? 'bg-muted text-foreground' 
                 : 'bg-primary text-primary-foreground hover:bg-primary/90'
             }`}
           >
             {isFollowing ? 'Following' : 'Follow'}
           </button>
         </div>
       )}
     </motion.div>
   );
 };