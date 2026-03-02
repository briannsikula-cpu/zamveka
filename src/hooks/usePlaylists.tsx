import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface PlaylistItem {
  id: string;
  playlist_id: string;
  item_type: "app_song" | "youtube" | "local";
  song_id: string | null;
  youtube_url: string | null;
  youtube_title: string | null;
  youtube_thumbnail: string | null;
  local_title: string | null;
  position: number;
  created_at: string;
  songs?: any;
}

export function usePlaylists() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlaylists = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setPlaylists((data as Playlist[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const createPlaylist = async (name: string, description?: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("playlists")
      .insert({ name, description: description || null, user_id: user.id })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return null;
    }
    await fetchPlaylists();
    return data as Playlist;
  };

  const deletePlaylist = async (id: string) => {
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await fetchPlaylists();
    }
  };

  const addItemToPlaylist = async (
    playlistId: string,
    item: {
      item_type: "app_song" | "youtube" | "local";
      song_id?: string;
      youtube_url?: string;
      youtube_title?: string;
      youtube_thumbnail?: string;
      local_title?: string;
    }
  ) => {
    // Get next position
    const { data: existing } = await supabase
      .from("playlist_items")
      .select("position")
      .eq("playlist_id", playlistId)
      .order("position", { ascending: false })
      .limit(1);
    const nextPos = existing && existing.length > 0 ? (existing[0] as any).position + 1 : 0;

    const { error } = await supabase.from("playlist_items").insert({
      playlist_id: playlistId,
      item_type: item.item_type,
      song_id: item.song_id || null,
      youtube_url: item.youtube_url || null,
      youtube_title: item.youtube_title || null,
      youtube_thumbnail: item.youtube_thumbnail || null,
      local_title: item.local_title || null,
      position: nextPos,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Added to playlist" });
    }
  };

  const getPlaylistItems = async (playlistId: string): Promise<PlaylistItem[]> => {
    const { data } = await supabase
      .from("playlist_items")
      .select("*, songs(*, artists(id, name, image_url))")
      .eq("playlist_id", playlistId)
      .order("position", { ascending: true });
    return (data as PlaylistItem[]) || [];
  };

  const removePlaylistItem = async (itemId: string) => {
    await supabase.from("playlist_items").delete().eq("id", itemId);
  };

  return {
    playlists,
    loading,
    createPlaylist,
    deletePlaylist,
    addItemToPlaylist,
    getPlaylistItems,
    removePlaylistItem,
    refetch: fetchPlaylists,
  };
}
