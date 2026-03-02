
-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playlists" ON public.playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create playlist_items table supporting 3 types: app_song, youtube, local
CREATE TABLE public.playlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('app_song', 'youtube', 'local')),
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE,
  youtube_url TEXT,
  youtube_title TEXT,
  youtube_thumbnail TEXT,
  local_title TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their playlist items" ON public.playlist_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_items.playlist_id AND user_id = auth.uid()));
CREATE POLICY "Users can add items to their playlists" ON public.playlist_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_items.playlist_id AND user_id = auth.uid()));
CREATE POLICY "Users can update their playlist items" ON public.playlist_items FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_items.playlist_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete their playlist items" ON public.playlist_items FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_items.playlist_id AND user_id = auth.uid()));
