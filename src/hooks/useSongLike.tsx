 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 import { toast } from 'sonner';
 
 export const useSongLike = (songId: string) => {
   const { user } = useAuth();
   const [isLiked, setIsLiked] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
 
   useEffect(() => {
     if (user && songId) {
       checkLikeStatus();
     } else {
       setIsLiked(false);
     }
   }, [user, songId]);
 
   const checkLikeStatus = async () => {
     if (!user) return;
     
     const { data } = await supabase
       .from('song_likes')
       .select('id')
       .eq('user_id', user.id)
       .eq('song_id', songId)
       .maybeSingle();
     
     setIsLiked(!!data);
   };
 
   const toggleLike = async () => {
     if (!user) {
       toast.error('Please sign in to like songs');
       return;
     }
 
     setIsLoading(true);
     
     try {
       if (isLiked) {
         const { error } = await supabase
           .from('song_likes')
           .delete()
           .eq('user_id', user.id)
           .eq('song_id', songId);
         
         if (error) throw error;
         setIsLiked(false);
       } else {
         const { error } = await supabase
           .from('song_likes')
           .insert({ user_id: user.id, song_id: songId });
         
         if (error) throw error;
         setIsLiked(true);
       }
     } catch (error) {
       console.error('Like error:', error);
       toast.error('Something went wrong');
     } finally {
       setIsLoading(false);
     }
   };
 
   return { isLiked, isLoading, toggleLike };
 };