import { useState, useEffect, useRef } from "react";
import { Heart, FileAudio, ListMusic, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/contexts/PlayerContext";
import { usePlaylists } from "@/hooks/usePlaylists";
import { SongCard } from "@/components/SongCard";
import { MiniPlayer } from "@/components/MiniPlayer";
import { BottomNav } from "@/components/BottomNav";
import { CreatePlaylistModal } from "@/components/CreatePlaylistModal";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Library() {
  const { user } = useAuth();
  const { currentSong, isPlaying, togglePlay, playSong } = usePlayer();
  const { playlists, loading: playlistsLoading, createPlaylist, deletePlaylist } = usePlaylists();
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [localFiles, setLocalFiles] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"liked" | "playlists" | "local">("liked");
  const localInputRef = useRef<HTMLInputElement>(null);

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

  const handleLocalFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((f) => ({
      name: f.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(f),
    }));
    setLocalFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const playLocalFile = (file: { name: string; url: string }) => {
    playSong({
      id: file.url,
      title: file.name,
      file_url: file.url,
      cover_url: null,
      artists: null,
    });
  };

  const tabs = [
    { key: "liked" as const, label: "Liked", icon: Heart },
    { key: "playlists" as const, label: "Playlists", icon: ListMusic },
    { key: "local" as const, label: "Local", icon: FileAudio },
  ];

  return (
    <div className="min-h-screen pb-32">
      <div className="pt-6 px-4">
        <h1 className="text-2xl font-bold mb-4">Your Library</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Liked Songs */}
        {activeTab === "liked" && (
          <>
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground fill-current" />
              </div>
              <div>
                <p className="font-bold">Liked Songs</p>
                <p className="text-xs text-muted-foreground">{likedSongs.length} songs</p>
              </div>
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : likedSongs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No liked songs yet</p>
            ) : (
              <div className="space-y-3">
                {likedSongs.map((song: any) => (
                  <SongCard key={song.id} song={song} isPlaying={currentSong?.id === song.id && isPlaying} onPlay={() => playSong(song, likedSongs)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Playlists */}
        {activeTab === "playlists" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{playlists.length} playlists</p>
              <CreatePlaylistModal onCreatePlaylist={createPlaylist} />
            </div>
            {playlistsLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : playlists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">No playlists yet</p>
                <CreatePlaylistModal
                  onCreatePlaylist={createPlaylist}
                  trigger={
                    <button className="gradient-button px-6 py-2 rounded-full text-sm font-medium text-primary-foreground">
                      <Plus className="w-4 h-4 inline mr-1" /> Create your first playlist
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-2">
                {playlists.map((pl) => (
                  <motion.div key={pl.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl flex items-center gap-3">
                    <Link to={`/playlist/${pl.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                        <ListMusic className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{pl.name}</p>
                        {pl.description && <p className="text-xs text-muted-foreground truncate">{pl.description}</p>}
                      </div>
                    </Link>
                    <button onClick={() => deletePlaylist(pl.id)} className="p-2 hover:bg-destructive/20 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Local Files */}
        {activeTab === "local" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{localFiles.length} files</p>
              <button
                onClick={() => localInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Files
              </button>
            </div>
            <input ref={localInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={handleLocalFiles} />
            {localFiles.length === 0 ? (
              <div className="text-center py-8">
                <FileAudio className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Pick audio files from your device</p>
                <button
                  onClick={() => localInputRef.current?.click()}
                  className="gradient-button px-6 py-2 rounded-full text-sm font-medium text-primary-foreground"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {localFiles.map((file, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-3 rounded-xl flex items-center gap-3 cursor-pointer"
                    onClick={() => playLocalFile(file)}
                  >
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                      <FileAudio className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-sm font-medium truncate flex-1">{file.name}</p>
                    <button className="p-2 gradient-button rounded-full">
                      {currentSong?.id === file.url && isPlaying ? (
                        <span className="w-4 h-4 block text-center text-xs">⏸</span>
                      ) : (
                        <span className="w-4 h-4 block text-center text-xs">▶</span>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {currentSong && <MiniPlayer song={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} />}
      <BottomNav />
    </div>
  );
}
