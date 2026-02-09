import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MoreVertical, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/contexts/PlayerContext";
import { BottomNav } from "./BottomNav";
import { MiniPlayer } from "./MiniPlayer";
import { Link } from "react-router-dom";

interface Artist {
  id: string;
  name: string;
  image_url: string | null;
  genre: string | null;
  followers_count: number;
}

interface Song {
  id: string;
  title: string;
  file_url: string;
  cover_url: string | null;
  plays_count: number;
  likes_count: number;
  genre: string | null;
  artists: { id: string; name: string; image_url: string | null } | null;
}

const filters = ["All", "Music", "Artists"];

export const HomeLoggedIn = () => {
  const { user } = useAuth();
  const { currentSong, isPlaying, togglePlay, playSong } = usePlayer();
  const [activeFilter, setActiveFilter] = useState("All");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [artistRes, songRes, profileRes] = await Promise.all([
      supabase.from("artists").select("*").order("followers_count", { ascending: false }).limit(10),
      supabase.from("songs").select("*, artists(id, name, image_url)").order("plays_count", { ascending: false }).limit(20),
      user
        ? supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    setArtists(artistRes.data || []);
    setSongs((songRes.data as Song[]) || []);
    if (profileRes.data) setProfile(profileRes.data);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg pt-4 pb-3 px-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40" />
            )}
          </Link>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Popular Artists */}
        {(activeFilter === "All" || activeFilter === "Artists") && artists.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Popular artists</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {artists.map((artist) => (
                <Link
                  key={artist.id}
                  to={`/artist/${artist.id}`}
                  className="flex-shrink-0 w-36 text-center"
                >
                  <div className="w-36 h-36 rounded-full overflow-hidden bg-muted mx-auto mb-2">
                    {artist.image_url ? (
                      <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                    )}
                  </div>
                  <p className="text-sm font-semibold truncate">{artist.name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Start listening */}
        {(activeFilter === "All" || activeFilter === "Music") && songs.length > 0 && (
          <section className="mb-8">
            <p className="text-xs text-muted-foreground mb-1">Jump into a session based on your tastes</p>
            <h2 className="text-xl font-bold mb-4">Start listening</h2>
            <div className="space-y-2">
              {songs.map((song) => (
                <motion.div
                  key={song.id}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                  onClick={() => playSong(song as any, songs as any)}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {song.cover_url ? (
                      <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Play className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{song.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{song.artists?.name || "Unknown"}</p>
                  </div>
                  {currentSong?.id === song.id && isPlaying ? (
                    <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-2">
                      <Pause className="w-4 h-4 text-primary fill-current" />
                    </button>
                  ) : null}
                  <button className="p-1 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {songs.length === 0 && artists.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No content yet. Check back soon!</p>
          </div>
        )}
      </div>

      {currentSong && (
        <MiniPlayer song={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} />
      )}
      <BottomNav />
    </div>
  );
};
