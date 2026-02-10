 import { useState, useEffect } from "react";
 import { motion } from "framer-motion";
 import { Camera, Plus, Music, Users, Heart, Edit2, Save, X } from "lucide-react";
 import { Header } from "@/components/Header";
 import { Footer } from "@/components/Footer";
 import { GlassCard } from "@/components/ui/GlassCard";
 import { GradientButton } from "@/components/ui/GradientButton";
 import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
 import { useAuth } from "@/hooks/useAuth";
 import { useArtistProfile } from "@/hooks/useArtistProfile";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { SongUploadModal } from "@/components/SongUploadModal";
 import { SongCard } from "@/components/SongCard";
 import { MusicPlayer } from "@/components/MusicPlayer";
 
 interface Song {
   id: string;
   title: string;
   file_url: string;
   cover_url: string | null;
   plays_count: number;
   likes_count: number;
   genre: string | null;
  artists?: { id: string; name: string; image_url: string | null } | null;
 }
 
 interface Follower {
   id: string;
   user_id: string;
   created_at: string;
   profiles?: { display_name: string | null; avatar_url: string | null };
 }
 
 const Profile = () => {
   const { user } = useAuth();
   const { artistProfile, isArtist, loading, refreshProfile } = useArtistProfile();
   const [isEditing, setIsEditing] = useState(false);
   const [uploadModalOpen, setUploadModalOpen] = useState(false);
   const [songs, setSongs] = useState<Song[]>([]);
   const [followers, setFollowers] = useState<Follower[]>([]);
   const [currentSong, setCurrentSong] = useState<Song | null>(null);
   const [uploadingAvatar, setUploadingAvatar] = useState(false);
   const [profile, setProfile] = useState({
     display_name: "",
     avatar_url: "",
   });
 
   useEffect(() => {
     if (user) {
       fetchProfile();
     }
   }, [user]);
 
   useEffect(() => {
     if (artistProfile) {
       fetchArtistSongs();
       fetchFollowers();
     }
   }, [artistProfile]);
 
   const fetchProfile = async () => {
     if (!user) return;
     
     const { data } = await supabase
       .from("profiles")
       .select("*")
       .eq("user_id", user.id)
       .maybeSingle();
 
     if (data) {
       setProfile({
         display_name: data.display_name || "",
         avatar_url: data.avatar_url || "",
       });
     }
   };
 
   const fetchArtistSongs = async () => {
     if (!artistProfile) return;
 
     const { data } = await supabase
       .from("songs")
       .select("*, artists(id, name, image_url)")
       .eq("artist_id", artistProfile.id)
       .order("created_at", { ascending: false });
 
     if (data) {
       setSongs(data);
     }
   };
 
   const fetchFollowers = async () => {
     if (!artistProfile) return;
 
     const { data } = await supabase
       .from("artist_followers")
       .select("*, profiles:user_id(display_name, avatar_url)")
       .eq("artist_id", artistProfile.id)
       .order("created_at", { ascending: false });
 
     if (data) {
       setFollowers(data as any);
     }
   };
 
   const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file || !user) return;
 
     if (!file.type.startsWith('image/')) {
       toast.error('Please upload an image file');
       return;
     }
 
     setUploadingAvatar(true);
 
     try {
       const ext = file.name.split('.').pop();
       const path = `${user.id}/${Date.now()}.${ext}`;
 
       const { error: uploadError } = await supabase.storage
         .from('avatars')
         .upload(path, file);
 
       if (uploadError) throw uploadError;
 
       const { data: urlData } = supabase.storage
         .from('avatars')
         .getPublicUrl(path);
 
       // Update or create profile
       const { data: existingProfile } = await supabase
         .from("profiles")
         .select("id")
         .eq("user_id", user.id)
         .maybeSingle();
 
       if (existingProfile) {
         await supabase
           .from("profiles")
           .update({ avatar_url: urlData.publicUrl })
           .eq("user_id", user.id);
       } else {
         await supabase
           .from("profiles")
           .insert({ user_id: user.id, avatar_url: urlData.publicUrl });
       }
 
       setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
       toast.success('Avatar updated!');
     } catch (error: any) {
       console.error('Avatar upload error:', error);
       toast.error('Failed to upload avatar');
     } finally {
       setUploadingAvatar(false);
     }
   };
 
   const handleSaveProfile = async () => {
     if (!user) return;
 
     try {
       const { data: existingProfile } = await supabase
         .from("profiles")
         .select("id")
         .eq("user_id", user.id)
         .maybeSingle();
 
       if (existingProfile) {
         await supabase
           .from("profiles")
           .update({ display_name: profile.display_name })
           .eq("user_id", user.id);
       } else {
         await supabase
           .from("profiles")
           .insert({ user_id: user.id, display_name: profile.display_name });
       }
 
       setIsEditing(false);
       toast.success('Profile updated!');
     } catch (error) {
       console.error('Profile update error:', error);
       toast.error('Failed to update profile');
     }
   };
 
   if (loading) {
     return (
       <div className="min-h-screen">
         <Header />
         <main className="pt-24 pb-10">
           <div className="container mx-auto px-4 flex justify-center">
             <div className="animate-pulse text-muted-foreground">Loading...</div>
           </div>
         </main>
       </div>
     );
   }
 
   if (!user) {
     return (
       <div className="min-h-screen">
         <Header />
         <main className="pt-24 pb-10">
           <div className="container mx-auto px-4 text-center">
             <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
             <p className="text-muted-foreground">You need to be signed in to view your profile.</p>
           </div>
         </main>
         <Footer />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen">
       <Header />
 
       <main className="pt-24 pb-24">
         <div className="container mx-auto px-4">
           {/* Profile Header */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-8"
           >
             <GlassCard className="p-6" hover={false}>
               <div className="flex flex-col md:flex-row items-center gap-6">
                 {/* Avatar */}
                 <div className="relative">
                   <Avatar className="w-24 h-24 md:w-32 md:h-32">
                     <AvatarImage src={profile.avatar_url} />
                     <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                       {profile.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                     </AvatarFallback>
                   </Avatar>
                   <label className="absolute bottom-0 right-0 p-2 glass-button rounded-full cursor-pointer hover:bg-muted transition-colors">
                     <Camera className="w-4 h-4" />
                     <input
                       type="file"
                       accept="image/*"
                       onChange={handleAvatarUpload}
                       className="hidden"
                       disabled={uploadingAvatar}
                     />
                   </label>
                 </div>
 
                 {/* Info */}
                 <div className="flex-1 text-center md:text-left">
                   {isEditing ? (
                     <div className="flex items-center gap-2 justify-center md:justify-start">
                       <input
                         type="text"
                         value={profile.display_name}
                         onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                         className="px-4 py-2 rounded-full bg-input border border-border focus:border-primary outline-none"
                         placeholder="Your name"
                       />
                       <button onClick={handleSaveProfile} className="p-2 text-primary hover:bg-muted rounded-full">
                         <Save className="w-5 h-5" />
                       </button>
                       <button onClick={() => setIsEditing(false)} className="p-2 text-destructive hover:bg-muted rounded-full">
                         <X className="w-5 h-5" />
                       </button>
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 justify-center md:justify-start">
                       <h1 className="text-2xl font-bold">
                         {profile.display_name || artistProfile?.name || user.email?.split('@')[0]}
                       </h1>
                       <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-muted rounded-full">
                         <Edit2 className="w-4 h-4 text-muted-foreground" />
                       </button>
                     </div>
                   )}
                   <p className="text-muted-foreground mt-1">{user.email}</p>
                   
                   {isArtist && artistProfile && (
                     <div className="flex items-center gap-4 mt-3 justify-center md:justify-start text-sm">
                       <div className="flex items-center gap-1">
                         <Music className="w-4 h-4 text-primary" />
                         <span>{songs.length} songs</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Users className="w-4 h-4 text-primary" />
                         <span>{artistProfile.followers_count} followers</span>
                       </div>
                     </div>
                   )}
                 </div>
 
                 {/* Actions */}
                 {isArtist && artistProfile && (
                   <GradientButton onClick={() => setUploadModalOpen(true)} className="flex items-center gap-2">
                     <Plus className="w-4 h-4" />
                     Add Song
                   </GradientButton>
                 )}
               </div>
             </GlassCard>
           </motion.div>
 
           {/* Artist Content */}
           {isArtist && artistProfile && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Songs */}
               <div className="lg:col-span-2">
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                 >
                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <Music className="w-5 h-5 text-primary" />
                     Your Songs
                   </h2>
 
                   {songs.length === 0 ? (
                     <GlassCard className="p-8 text-center" hover={false}>
                       <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                       <p className="text-muted-foreground mb-4">You haven't uploaded any songs yet.</p>
                       <GradientButton onClick={() => setUploadModalOpen(true)}>
                         Upload Your First Song
                       </GradientButton>
                     </GlassCard>
                   ) : (
                     <div className="space-y-3">
                       {songs.map((song) => (
                         <SongCard
                           key={song.id}
                           song={song}
                           isPlaying={currentSong?.id === song.id}
                           onPlay={() => setCurrentSong(song)}
                         />
                       ))}
                     </div>
                   )}
                 </motion.div>
               </div>
 
               {/* Followers */}
               <div>
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                 >
                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                     <Users className="w-5 h-5 text-primary" />
                     Followers ({followers.length})
                   </h2>
 
                   <GlassCard className="p-4" hover={false}>
                     {followers.length === 0 ? (
                       <p className="text-center text-muted-foreground py-4">No followers yet</p>
                     ) : (
                       <div className="space-y-3 max-h-96 overflow-y-auto">
                         {followers.map((follower) => (
                           <div key={follower.id} className="flex items-center gap-3">
                             <Avatar className="w-10 h-10">
                               <AvatarImage src={follower.profiles?.avatar_url || undefined} />
                               <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-sm">
                                 {follower.profiles?.display_name?.charAt(0) || 'U'}
                               </AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-medium text-sm">
                                 {follower.profiles?.display_name || 'Anonymous User'}
                               </p>
                               <p className="text-xs text-muted-foreground">
                                 Followed {new Date(follower.created_at).toLocaleDateString()}
                               </p>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </GlassCard>
                 </motion.div>
               </div>
             </div>
           )}
 
            {/* Regular User Content */}
            {!isArtist && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <GlassCard className="p-6 text-center" hover={false}>
                  <Music className="w-12 h-12 mx-auto text-primary mb-4" />
                  <h2 className="text-xl font-bold mb-2">Become an Artist</h2>
                  <p className="text-muted-foreground mb-4">
                    Apply as an artist to upload your music, gain followers, and share your sound with the world.
                  </p>
                  <GradientButton onClick={() => window.location.href = '/apply'}>
                    Apply as Artist
                  </GradientButton>
                </GlassCard>

                <GlassCard className="p-6 text-center" hover={false}>
                  <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-bold mb-2">Discover Music</h2>
                  <p className="text-muted-foreground mb-4">
                    Browse trending songs, follow your favorite artists, and build your collection.
                  </p>
                  <GradientButton variant="outline" onClick={() => window.location.href = '/trending'}>
                    Explore Music
                  </GradientButton>
                </GlassCard>
              </motion.div>
            )}
         </div>
       </main>
 
       {/* Song Upload Modal */}
       {artistProfile && (
         <SongUploadModal
           isOpen={uploadModalOpen}
           onClose={() => setUploadModalOpen(false)}
           artistId={artistProfile.id}
           onSuccess={fetchArtistSongs}
         />
       )}
 
       {/* Music Player */}
       {currentSong && (
         <MusicPlayer
           song={currentSong}
           onClose={() => setCurrentSong(null)}
           playlist={songs}
            onSongChange={(song) => setCurrentSong(song as Song)}
         />
       )}
 
       <Footer />
     </div>
   );
 };
 
 export default Profile;
