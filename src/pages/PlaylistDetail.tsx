import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Trash2, Youtube, Music, FileAudio, MoreVertical } from "lucide-react";
import { usePlaylists, PlaylistItem } from "@/hooks/usePlaylists";
import { usePlayer } from "@/contexts/PlayerContext";
import { MiniPlayer } from "@/components/MiniPlayer";
import { BottomNav } from "@/components/BottomNav";
import { SongOptionsSheet } from "@/components/SongOptionsSheet";
import { YouTubePlayer } from "@/components/YouTubePlayer";

export default function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, getPlaylistItems, removePlaylistItem } = usePlaylists();
  const { currentSong, isPlaying, togglePlay, playSong } = usePlayer();
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYoutube, setActiveYoutube] = useState<string | null>(null);
  const [localFiles, setLocalFiles] = useState<Map<string, string>>(new Map());
  const [optionsSong, setOptionsSong] = useState<any>(null);
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

  const getSongTitle = (item: PlaylistItem) => {
    if (item.item_type === "app_song") return item.songs?.title || "Unknown";
    if (item.item_type === "youtube") return item.youtube_title || "YouTube";
    return item.local_title || "Local File";
  };

  const getArtistName = (item: PlaylistItem) => {
    if (item.item_type === "app_song") return item.songs?.artists?.name || "Unknown";
    if (item.item_type === "youtube") return "YouTube";
    return "Local file";
  };

  const isCurrentlyPlaying = (item: PlaylistItem) => {
    const songId = item.item_type === "app_song" ? item.songs?.id : item.id;
    return currentSong?.id === songId && isPlaying;
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="pt-6 px-4">
        <button onClick={() => navigate("/library")} className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-2xl font-bold mb-1">{playlist?.name || "Playlist"}</h1>
        {playlist?.description && <p className="text-sm text-muted-foreground mb-2">{playlist.description}</p>}
        <p className="text-xs text-muted-foreground mb-4">{items.length} tracks</p>

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
          <div className="divide-y divide-border/20">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 group"
              >
                {/* Track number */}
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">{index + 1}</span>

                {/* Play button / Cover */}
                <button
                  onClick={() => {
                    if (item.item_type === "app_song") handlePlayAppSong(item);
                    else if (item.item_type === "youtube") setActiveYoutube(item.youtube_url!);
                    else handlePlayLocal(item);
                  }}
                  className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden"
                >
                  {item.item_type === "app_song" && item.songs?.cover_url ? (
                    <img src={item.songs.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : isCurrentlyPlaying(item) ? (
                    <Pause className="w-4 h-4 text-primary fill-current" />
                  ) : (
                    <Play className="w-4 h-4 text-muted-foreground fill-current ml-0.5" />
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isCurrentlyPlaying(item) ? "text-primary" : ""}`}>
                    {getSongTitle(item)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{getArtistName(item)}</p>
                </div>

                {/* Type badge */}
                {item.item_type === "youtube" && <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                {item.item_type === "local" && <FileAudio className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}

                {/* Options for app songs */}
                {item.item_type === "app_song" && item.songs && (
                  <button
                    onClick={() => setOptionsSong(item.songs)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}

                {/* Remove */}
                <button onClick={() => handleRemove(item.id)} className="p-1.5 hover:bg-destructive/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <SongOptionsSheet song={optionsSong} open={!!optionsSong} onClose={() => setOptionsSong(null)} />
      {currentSong && <MiniPlayer song={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} />}
      <BottomNav />
    </div>
  );
}
