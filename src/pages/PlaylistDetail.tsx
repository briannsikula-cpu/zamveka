import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Trash2, Youtube, Music, FileAudio } from "lucide-react";
import { usePlaylists, PlaylistItem } from "@/hooks/usePlaylists";
import { usePlayer } from "@/contexts/PlayerContext";
import { MiniPlayer } from "@/components/MiniPlayer";
import { BottomNav } from "@/components/BottomNav";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { motion } from "framer-motion";

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, getPlaylistItems, removePlaylistItem } = usePlaylists();
  const { currentSong, isPlaying, togglePlay, playSong } = usePlayer();
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYoutube, setActiveYoutube] = useState<string | null>(null);
  const [localFiles, setLocalFiles] = useState<Map<string, string>>(new Map());
  const localInputRef = useRef<HTMLInputElement>(null);

  const playlist = playlists.find((p) => p.id === id);

  useEffect(() => {
    if (id) {
      getPlaylistItems(id).then((data) => {
        setItems(data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleRemove = async (itemId: string) => {
    await removePlaylistItem(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handlePlayAppSong = (item: PlaylistItem) => {
    if (!item.songs) return;
    const appSongs = items.filter((i) => i.item_type === "app_song" && i.songs).map((i) => i.songs);
    playSong(item.songs, appSongs);
  };

  const handlePlayLocal = (item: PlaylistItem) => {
    const url = localFiles.get(item.id);
    if (url) {
      playSong({
        id: item.id,
        title: item.local_title || "Local File",
        file_url: url,
        cover_url: null,
        artists: null,
      });
    }
  };

  const handleAddLocalFiles = () => localInputRef.current?.click();

  const onLocalFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const tempId = crypto.randomUUID();
      setLocalFiles((prev) => new Map(prev).set(tempId, url));
      // Add to items locally (not persisted — local files are device-only)
      setItems((prev) => [
        ...prev,
        {
          id: tempId,
          playlist_id: id!,
          item_type: "local" as const,
          song_id: null,
          youtube_url: null,
          youtube_title: null,
          youtube_thumbnail: null,
          local_title: file.name.replace(/\.[^/.]+$/, ""),
          position: prev.length,
          created_at: new Date().toISOString(),
        },
      ]);
    });
    e.target.value = "";
  };

  const typeIcon = (type: string) => {
    if (type === "youtube") return <Youtube className="w-4 h-4 text-red-500" />;
    if (type === "local") return <FileAudio className="w-4 h-4 text-accent" />;
    return <Music className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="pt-6 px-4">
        <button onClick={() => navigate("/library")} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-1">{playlist?.name || "Playlist"}</h1>
        {playlist?.description && <p className="text-sm text-muted-foreground mb-4">{playlist.description}</p>}

        <div className="flex gap-2 mb-6">
          <button onClick={handleAddLocalFiles} className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 transition-colors flex items-center gap-1">
            <FileAudio className="w-3 h-3" /> Add Local Files
          </button>
        </div>
        <input ref={localInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={onLocalFilesSelected} />

        {activeYoutube && (
          <div className="mb-4">
            <YouTubePlayer url={activeYoutube} onClose={() => setActiveYoutube(null)} />
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">This playlist is empty</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-3 rounded-xl flex items-center gap-3"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  {item.item_type === "app_song" && item.songs?.cover_url ? (
                    <img src={item.songs.cover_url} alt="" className="w-full h-full object-cover rounded-md" />
                  ) : (
                    typeIcon(item.item_type)
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.item_type === "app_song" ? item.songs?.title : item.item_type === "youtube" ? item.youtube_title : item.local_title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.item_type === "app_song" ? item.songs?.artists?.name : item.item_type === "youtube" ? "YouTube" : "Local file"}
                  </p>
                </div>

                {/* Play */}
                <button
                  onClick={() => {
                    if (item.item_type === "app_song") handlePlayAppSong(item);
                    else if (item.item_type === "youtube") setActiveYoutube(item.youtube_url!);
                    else handlePlayLocal(item);
                  }}
                  className="p-2 gradient-button rounded-full"
                >
                  {item.item_type === "youtube" ? (
                    <Youtube className="w-4 h-4" />
                  ) : currentSong?.id === (item.item_type === "app_song" ? item.songs?.id : item.id) && isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Remove */}
                <button onClick={() => handleRemove(item.id)} className="p-2 hover:bg-destructive/20 rounded-full transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {currentSong && <MiniPlayer song={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} />}
      <BottomNav />
    </div>
  );
}
