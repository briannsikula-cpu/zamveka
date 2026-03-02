import { useState } from "react";
import { X } from "lucide-react";

interface YouTubePlayerProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export const YouTubePlayer = ({ url, title, onClose }: YouTubePlayerProps) => {
  const videoId = extractVideoId(url);
  
  if (!videoId) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Invalid YouTube URL
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-background">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title || "YouTube video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
};

export { extractVideoId };
