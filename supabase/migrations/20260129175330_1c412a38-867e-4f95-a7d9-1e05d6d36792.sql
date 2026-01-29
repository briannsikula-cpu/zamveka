-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create artists table
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  genre TEXT,
  followers_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on artists
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Artists are publicly viewable
CREATE POLICY "Artists are viewable by everyone"
  ON public.artists FOR SELECT
  USING (true);

-- Create artist_followers junction table
CREATE TABLE public.artist_followers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, artist_id)
);

-- Enable RLS on artist_followers
ALTER TABLE public.artist_followers ENABLE ROW LEVEL SECURITY;

-- Users can see all follows (for counting)
CREATE POLICY "Follows are viewable by everyone"
  ON public.artist_followers FOR SELECT
  USING (true);

-- Users can follow artists
CREATE POLICY "Authenticated users can follow artists"
  ON public.artist_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unfollow artists
CREATE POLICY "Users can unfollow artists"
  ON public.artist_followers FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update follower count
CREATE OR REPLACE FUNCTION public.update_artist_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.artists SET followers_count = followers_count + 1 WHERE id = NEW.artist_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.artists SET followers_count = followers_count - 1 WHERE id = OLD.artist_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update follower count
CREATE TRIGGER update_followers_count
AFTER INSERT OR DELETE ON public.artist_followers
FOR EACH ROW
EXECUTE FUNCTION public.update_artist_followers_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artists_updated_at
BEFORE UPDATE ON public.artists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample artists
INSERT INTO public.artists (name, bio, image_url, genre) VALUES
  ('Patience Namadingo', 'Award-winning gospel and afro-pop artist from Malawi', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', 'Gospel'),
  ('Lulu', 'Rising star in the Malawian music scene', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400', 'Afro-pop'),
  ('Piksy', 'Hip-hop legend and cultural icon', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', 'Hip-hop'),
  ('Faith Mussa', 'Soulful singer-songwriter', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', 'R&B'),
  ('Eli Njuchi', 'Contemporary Afrobeat sensation', 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400', 'Afrobeat'),
  ('Gwamba', 'Versatile hip-hop artist', 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400', 'Hip-hop');