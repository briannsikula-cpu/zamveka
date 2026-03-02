import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreatePlaylistModalProps {
  onCreatePlaylist: (name: string, description?: string) => Promise<any>;
  trigger?: React.ReactNode;
}

export const CreatePlaylistModal = ({ onCreatePlaylist, trigger }: CreatePlaylistModalProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onCreatePlaylist(name.trim(), description.trim() || undefined);
    setName("");
    setDescription("");
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Playlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-card border-border/30">
        <DialogHeader>
          <DialogTitle>Create Playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="Playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-input"
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-input"
          />
          <Button onClick={handleCreate} disabled={!name.trim() || loading} className="w-full gradient-button text-primary-foreground">
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
