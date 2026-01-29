import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useFollowArtist = (artistId: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && artistId) {
      checkFollowStatus();
    } else {
      setIsFollowing(false);
    }
  }, [user, artistId]);

  const checkFollowStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('artist_followers')
      .select('id')
      .eq('user_id', user.id)
      .eq('artist_id', artistId)
      .maybeSingle();
    
    setIsFollowing(!!data);
  };

  const toggleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow artists');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('artist_followers')
          .delete()
          .eq('user_id', user.id)
          .eq('artist_id', artistId);
        
        if (error) throw error;
        setIsFollowing(false);
        toast.success('Unfollowed artist');
      } else {
        const { error } = await supabase
          .from('artist_followers')
          .insert({ user_id: user.id, artist_id: artistId });
        
        if (error) throw error;
        setIsFollowing(true);
        toast.success('Following artist!');
      }
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return { isFollowing, isLoading, toggleFollow };
};
