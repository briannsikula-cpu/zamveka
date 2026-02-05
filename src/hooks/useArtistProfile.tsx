 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from './useAuth';
 
 interface ArtistProfile {
   id: string;
   name: string;
   bio: string | null;
   genre: string | null;
   image_url: string | null;
   followers_count: number;
   user_id: string | null;
 }
 
 export const useArtistProfile = () => {
   const { user } = useAuth();
   const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
   const [isArtist, setIsArtist] = useState(false);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (user) {
       checkArtistStatus();
     } else {
       setLoading(false);
       setIsArtist(false);
       setArtistProfile(null);
     }
   }, [user]);
 
   const checkArtistStatus = async () => {
     if (!user) return;
     
     try {
       // Check if user is an approved artist
       const { data: approval } = await supabase
         .from("user_approvals")
         .select("status, display_name")
         .eq("user_id", user.id)
         .eq("status", "approved")
         .maybeSingle();
 
       if (approval) {
         setIsArtist(true);
         
         // Get or create artist profile
         let { data: artist } = await supabase
           .from("artists")
           .select("*")
           .eq("user_id", user.id)
           .maybeSingle();
 
         if (!artist) {
           // Create artist profile if it doesn't exist
           const { data: newArtist, error } = await supabase
             .from("artists")
             .insert({
               name: approval.display_name || user.email?.split('@')[0] || 'Artist',
               user_id: user.id,
             })
             .select()
             .single();
 
           if (!error && newArtist) {
             artist = newArtist;
           }
         }
 
         setArtistProfile(artist);
       } else {
         setIsArtist(false);
       }
     } catch (error) {
       console.error("Error checking artist status:", error);
     } finally {
       setLoading(false);
     }
   };
 
   const refreshProfile = () => {
     checkArtistStatus();
   };
 
   return { artistProfile, isArtist, loading, refreshProfile };
 };