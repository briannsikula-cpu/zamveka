 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { X, Upload, Music, Image } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { toast } from "sonner";
 import { GradientButton } from "./ui/GradientButton";
 
 interface SongUploadModalProps {
   isOpen: boolean;
   onClose: () => void;
   artistId: string;
   onSuccess: () => void;
 }
 
 export const SongUploadModal = ({ isOpen, onClose, artistId, onSuccess }: SongUploadModalProps) => {
   const { user } = useAuth();
   const [uploading, setUploading] = useState(false);
   const [audioFile, setAudioFile] = useState<File | null>(null);
   const [coverFile, setCoverFile] = useState<File | null>(null);
   const [formData, setFormData] = useState({
     title: "",
     genre: "",
   });
 
   const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
       if (!validTypes.includes(file.type)) {
         toast.error('Please upload an MP3 or WAV file');
         return;
       }
       if (file.size > 50 * 1024 * 1024) {
         toast.error('File size must be less than 50MB');
         return;
       }
       setAudioFile(file);
     }
   };
 
   const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       if (!file.type.startsWith('image/')) {
         toast.error('Please upload an image file');
         return;
       }
       setCoverFile(file);
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!user || !audioFile) {
       toast.error('Please select an audio file');
       return;
     }
 
     setUploading(true);
 
     try {
       // Upload audio file
       const audioExt = audioFile.name.split('.').pop();
       const audioPath = `${user.id}/${Date.now()}.${audioExt}`;
       
       const { error: audioError } = await supabase.storage
         .from('audio')
         .upload(audioPath, audioFile);
 
       if (audioError) throw audioError;
 
       const { data: audioUrlData } = supabase.storage
         .from('audio')
         .getPublicUrl(audioPath);
 
       let coverUrl = null;
 
       // Upload cover image if provided
       if (coverFile) {
         const coverExt = coverFile.name.split('.').pop();
         const coverPath = `${user.id}/${Date.now()}.${coverExt}`;
         
         const { error: coverError } = await supabase.storage
           .from('covers')
           .upload(coverPath, coverFile);
 
         if (!coverError) {
           const { data: coverUrlData } = supabase.storage
             .from('covers')
             .getPublicUrl(coverPath);
           coverUrl = coverUrlData.publicUrl;
         }
       }
 
       // Create song record
       const { error: songError } = await supabase
         .from('songs')
         .insert({
           artist_id: artistId,
           title: formData.title,
           file_url: audioUrlData.publicUrl,
           cover_url: coverUrl,
           genre: formData.genre || null,
         });
 
       if (songError) throw songError;
 
       toast.success('Song uploaded successfully!');
       onSuccess();
       onClose();
       setFormData({ title: "", genre: "" });
       setAudioFile(null);
       setCoverFile(null);
     } catch (error: any) {
       console.error('Upload error:', error);
       toast.error(error.message || 'Failed to upload song');
     } finally {
       setUploading(false);
     }
   };
 
   return (
     <AnimatePresence>
       {isOpen && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
           onClick={onClose}
         >
           <motion.div
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.95, opacity: 0 }}
             onClick={(e) => e.stopPropagation()}
             className="w-full max-w-md glass-card p-6 rounded-2xl"
           >
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold">Upload New Song</h2>
               <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
 
             <form onSubmit={handleSubmit} className="space-y-4">
               {/* Title */}
               <div className="space-y-2">
                 <label className="text-sm font-medium">Song Title</label>
                 <input
                   type="text"
                   value={formData.title}
                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                   required
                   className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary outline-none transition-all"
                   placeholder="Enter song title"
                 />
               </div>
 
               {/* Genre */}
               <div className="space-y-2">
                 <label className="text-sm font-medium">Genre</label>
                 <select
                   value={formData.genre}
                   onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                   className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:border-primary outline-none transition-all"
                 >
                   <option value="">Select genre</option>
                   <option value="afrobeats">Afrobeats</option>
                   <option value="hiphop">Hip Hop</option>
                   <option value="gospel">Gospel</option>
                   <option value="reggae">Reggae</option>
                   <option value="rnb">R&B</option>
                   <option value="dancehall">Dancehall</option>
                   <option value="traditional">Traditional</option>
                 </select>
               </div>
 
               {/* Audio File */}
               <div className="space-y-2">
                 <label className="text-sm font-medium">Audio File (MP3 or WAV)</label>
                 <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                   <Music className="w-6 h-6 text-muted-foreground" />
                   <span className="text-sm text-muted-foreground">
                     {audioFile ? audioFile.name : 'Click to upload audio'}
                   </span>
                   <input
                     type="file"
                     accept="audio/mpeg,audio/wav,audio/mp3"
                     onChange={handleAudioChange}
                     className="hidden"
                   />
                 </label>
               </div>
 
               {/* Cover Image */}
               <div className="space-y-2">
                 <label className="text-sm font-medium">Cover Image (optional)</label>
                 <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                   <Image className="w-6 h-6 text-muted-foreground" />
                   <span className="text-sm text-muted-foreground">
                     {coverFile ? coverFile.name : 'Click to upload cover'}
                   </span>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={handleCoverChange}
                     className="hidden"
                   />
                 </label>
               </div>
 
               <GradientButton type="submit" className="w-full" disabled={uploading || !audioFile}>
                 {uploading ? (
                   <span className="flex items-center gap-2">
                     <Upload className="w-4 h-4 animate-pulse" />
                     Uploading...
                   </span>
                 ) : (
                   <span className="flex items-center gap-2">
                     <Upload className="w-4 h-4" />
                     Upload Song
                   </span>
                 )}
               </GradientButton>
             </form>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 };