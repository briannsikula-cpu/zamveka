import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/contexts/PlayerContext";
import { SongCard } from "@/components/SongCard";
import { MiniPlayer } from "@/components/MiniPlayer";
import { BottomNav } from "@/components/BottomNav";

export default function Library() {
  const { user } = useAuth();
  const { currentSong, isPlaying, togglePlay, playSong } = usePlayer();
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchLikedSongs();
  }, [user]);

  const fetchLikedSongs = async () => {
    const { data } = await supabase
      .from("song_likes")
      .select("song_id, songs(*, artists(id, name, image_url))")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    
    setLikedSongs((data || []).map((d: any) => d.songs).filter(Boolean));
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="pt-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Your Library</h1>

        {/* Liked Songs */}
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground fill-current" />
          </div>
          <div>
            <p className="font-bold">Liked Songs</p>
            <p className="text-xs text-muted-foreground">Playlist · {likedSongs.length} songs</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : likedSongs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No liked songs yet</p>
        ) : (
          <div className="space-y-3">
            {likedSongs.map((song: any) => (
              <SongCard
                key={song.id}
                song={song}
                isPlaying={currentSong?.id === song.id && isPlaying}
                onPlay={() => playSong(song, likedSongs)}
              />
            ))}
          </div>
        )}
      </div>

      {currentSong && (
        <MiniPlayer song={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} />
      )}
      <BottomNav />
    </div>
  );
}
