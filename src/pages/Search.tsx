import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { MiniPlayer } from "@/components/MiniPlayer";
import { usePlayer } from "@/contexts/PlayerContext";
import { supabase } from "@/integrations/supabase/client";
import { SongCard } from "@/components/SongCard";

const genres = [
  { name: "Afrobeats", color: "from-primary/60 to-primary/20" },
  { name: "Gospel", color: "from-secondary/60 to-secondary/20" },
  { name: "Hip Hop", color: "from-accent/60 to-accent/20" },
  { name: "R&B", color: "from-destructive/60 to-destructive/20" },
  { name: "Dancehall", color: "from-primary/40 to-accent/40" },
  { name: "Reggae", color: "from-secondary/40 to-primary/40" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const { currentSong, isPlaying, togglePlay, playSong } = usePlayer();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => searchSongs(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const searchSongs = async (q: string) => {
    setSearching(true);
    const { data } = await supabase
      .from("songs")
      .select("*, artists(id, name, image_url)")
      .ilike("title", `%${q}%`)
      .limit(20);
    setResults(data || []);
    setSearching(false);
  };

  const searchByGenre = async (genre: string) => {
    setQuery(genre);
    setSearching(true);
    const { data } = await supabase
      .from("songs")
      .select("*, artists(id, name, image_url)")
      .ilike("genre", `%${genre}%`)
      .limit(20);
    setResults(data || []);
    setSearching(false);
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="pt-6 px-4">
        <h1 className="text-2xl font-bold mb-4">Search</h1>

        {/* Search input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Genre discovery or results */}
        {results.length === 0 && !searching && query.length < 2 ? (
          <>
            <h2 className="text-lg font-bold mb-3">Discover something new</h2>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {genres.map((genre) => (
                <motion.button
                  key={genre.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => searchByGenre(genre.name)}
                  className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${genre.color} flex items-end p-3`}
                >
                  <span className="text-xs font-bold text-foreground">#{genre.name.toLowerCase()}</span>
                </motion.button>
              ))}
            </div>

            <h2 className="text-lg font-bold">Browse all</h2>
          </>
        ) : (
          <div className="space-y-3">
            {searching && <p className="text-sm text-muted-foreground">Searching...</p>}
            {results.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                isPlaying={currentSong?.id === song.id && isPlaying}
                onPlay={() => playSong(song, results)}
              />
            ))}
            {!searching && results.length === 0 && query.length >= 2 && (
              <p className="text-sm text-muted-foreground text-center py-8">No results found for "{query}"</p>
            )}
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
