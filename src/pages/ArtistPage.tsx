import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFollowArtist } from "@/hooks/useFollowArtist";
import { usePlayer } from "@/contexts/PlayerContext";
import { ArrowLeft, UserPlus, UserCheck, Play, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Artist {
  id: string;
  name: string;
  bio: string | null;
  genre: string | null;
  image_url: string | null;
  followers_count: number;
}

interface Song {
  id: string;
  title: string;
  file_url: string;
  cover_url: string | null;
  duration: number | null;
  plays_count: number;
  genre: string | null;
}

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFollowing, isLoading: followLoading, toggleFollow } = useFollowArtist(id || "");
  const { playSong } = usePlayer();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchArtist();
  }, [id]);

  const fetchArtist = async () => {
    const [artistRes, songsRes] = await Promise.all([
      supabase.from("artists").select("*").eq("id", id!).single(),
      supabase.from("songs").select("*").eq("artist_id", id!).order("created_at", { ascending: false }),
    ]);

    if (artistRes.data) setArtist(artistRes.data);
    if (songsRes.data) setSongs(songsRes.data);
    setLoading(false);
  };

  const handleFollow = () => {
    if (!user) { navigate("/auth"); return; }
    toggleFollow();
  };

  const handlePlay = (song: Song) => {
    playSong({
      id: song.id,
      title: song.title,
      file_url: song.file_url,
      cover_url: song.cover_url,
      artists: artist ? { name: artist.name, id: artist.id, image_url: artist.image_url } : null,
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Artist not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {artist.image_url ? (
          <img
            src={artist.image_url}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/50 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-24">
        {/* Artist Info */}
        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{artist.name}</h1>
            {artist.genre && <p className="text-sm text-muted-foreground mt-1">{artist.genre}</p>}
            <p className="text-sm text-muted-foreground">{artist.followers_count} followers · {songs.length} songs</p>
          </div>
          <Button
            onClick={handleFollow}
            disabled={followLoading}
            variant={isFollowing ? "secondary" : "default"}
            className="gap-2"
          >
            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>

        {artist.bio && <p className="text-muted-foreground mb-8 max-w-2xl">{artist.bio}</p>}

        {/* Songs */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Songs</h2>
        {songs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No songs yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {songs.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handlePlay(song)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group"
              >
                <span className="text-sm text-muted-foreground w-6 text-right">{i + 1}</span>
                <img
                  src={song.cover_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100"}
                  alt={song.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{song.title}</p>
                  <p className="text-xs text-muted-foreground">{song.plays_count} plays</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDuration(song.duration)}</span>
                <Play className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
