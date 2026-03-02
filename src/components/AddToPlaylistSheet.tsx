import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ListPlus, Youtube, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePlaylists } from "@/hooks/usePlaylists";
import { CreatePlaylistModal } from "@/components/CreatePlaylistModal";

interface AddToPlaylistSheetProps {
  songId?: string;
  trigger?: React.ReactNode;
}

export const AddToPlaylistSheet = ({ songId, trigger }: AddToPlaylistSheetProps) => {
  const [open, setOpen] = useState(false);
  const [ytTab, setYtTab] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const { playlists, addItemToPlaylist, createPlaylist } = usePlaylists();

  const handleAddSong = async (playlistId: string) => {
    if (songId) {
      await addItemToPlaylist(playlistId, { item_type: "app_song", song_id: songId });
    }
    setOpen(false);
  };

  const handleAddYoutube = async (playlistId: string) => {
    if (!ytUrl.trim()) return;
    await addItemToPlaylist(playlistId, {
      item_type: "youtube",
      youtube_url: ytUrl.trim(),
      youtube_title: ytTitle.trim() || "YouTube Video",
    });
    setYtUrl("");
    setYtTitle("");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <ListPlus className="w-5 h-5" />
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="glass-card border-border/30 rounded-t-2xl max-h-[70vh]">
        <SheetHeader>
          <SheetTitle>{ytTab ? "Add YouTube Link" : "Add to Playlist"}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3 overflow-y-auto">
          {!ytTab ? (
            <>
              <div className="flex gap-2">
                <CreatePlaylistModal onCreatePlaylist={createPlaylist} />
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setYtTab(true)}>
                  <Youtube className="w-4 h-4" /> Add YouTube
                </Button>
              </div>
              {playlists.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No playlists yet</p>
              ) : (
                playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => handleAddSong(pl.id)}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                      <ListPlus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{pl.name}</p>
                      {pl.description && <p className="text-xs text-muted-foreground">{pl.description}</p>}
                    </div>
                  </button>
                ))
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setYtTab(false)}>← Back</Button>
              <Input placeholder="YouTube URL" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} className="bg-input" />
              <Input placeholder="Title (optional)" value={ytTitle} onChange={(e) => setYtTitle(e.target.value)} className="bg-input" />
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAddYoutube(pl.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium text-sm">Add to: {pl.name}</p>
                </button>
              ))}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
