-- Create songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER, -- duration in seconds
  genre TEXT,
  plays_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on songs
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Songs are viewable by everyone
CREATE POLICY "Songs are viewable by everyone"
ON public.songs
FOR SELECT
USING (true);

-- Artists can insert their own songs (need to check if user owns the artist profile)
CREATE POLICY "Artists can insert their own songs"
ON public.songs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_approvals
    WHERE user_id = auth.uid()
    AND status = 'approved'
  )
);

-- Artists can update their own songs
CREATE POLICY "Artists can update their own songs"
ON public.songs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_approvals ua
    JOIN public.artists a ON a.name = ua.display_name
    WHERE ua.user_id = auth.uid()
    AND ua.status = 'approved'
    AND a.id = artist_id
  )
);

-- Artists can delete their own songs
CREATE POLICY "Artists can delete their own songs"
ON public.songs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_approvals ua
    JOIN public.artists a ON a.name = ua.display_name
    WHERE ua.user_id = auth.uid()
    AND ua.status = 'approved'
    AND a.id = artist_id
  )
);

-- Create song_likes table
CREATE TABLE public.song_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- Enable RLS on song_likes
ALTER TABLE public.song_likes ENABLE ROW LEVEL SECURITY;

-- Likes are viewable by everyone
CREATE POLICY "Likes are viewable by everyone"
ON public.song_likes
FOR SELECT
USING (true);

-- Authenticated users can like songs
CREATE POLICY "Authenticated users can like songs"
ON public.song_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unlike songs
CREATE POLICY "Users can unlike songs"
ON public.song_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Add user_id column to artists table to link artist profile to user
ALTER TABLE public.artists ADD COLUMN user_id UUID;

-- Create trigger to update songs likes_count
CREATE OR REPLACE FUNCTION public.update_song_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.songs SET likes_count = likes_count + 1 WHERE id = NEW.song_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.songs SET likes_count = likes_count - 1 WHERE id = OLD.song_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_song_likes_count_trigger
AFTER INSERT OR DELETE ON public.song_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_song_likes_count();

-- Create trigger for songs updated_at
CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for audio files and avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);

-- Storage policies for audio bucket
CREATE POLICY "Audio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for covers bucket
CREATE POLICY "Covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'covers');

CREATE POLICY "Authenticated users can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own covers"
ON storage.objects FOR DELETE
USING (bucket_id = 'covers' AND auth.uid()::text = (storage.foldername(name))[1]);