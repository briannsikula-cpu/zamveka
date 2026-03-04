import { useState, useEffect, useCallback, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const BANDS = [
  { freq: "60", label: "60Hz" },
  { freq: "230", label: "230Hz" },
  { freq: "910", label: "910Hz" },
  { freq: "3.6k", label: "3.6kHz" },
  { freq: "14k", label: "14kHz" },
];

const PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0],
  Bass: [6, 4, 0, -2, -1],
  Pop: [-1, 2, 4, 2, -1],
  Rock: [4, 2, -1, 2, 4],
  Jazz: [3, 1, -1, 1, 3],
  Classical: [3, 2, 0, 2, 3],
  "Hip Hop": [5, 3, 0, 1, 2],
  Electronic: [4, 2, 0, 2, 4],
};

export const Equalizer = () => {
  const [gains, setGains] = useState<number[]>(() => {
    const saved = localStorage.getItem("zv_eq_gains");
    return saved ? JSON.parse(saved) : [0, 0, 0, 0, 0];
  });
  const [activePreset, setActivePreset] = useState<string>(() =>
    localStorage.getItem("zv_eq_preset") || "Flat"
  );

  useEffect(() => {
    localStorage.setItem("zv_eq_gains", JSON.stringify(gains));
  }, [gains]);

  const handleBandChange = (index: number, value: number) => {
    const newGains = [...gains];
    newGains[index] = value;
    setGains(newGains);
    setActivePreset("");
    localStorage.setItem("zv_eq_preset", "");
  };

  const applyPreset = (name: string) => {
    setGains([...PRESETS[name]]);
    setActivePreset(name);
    localStorage.setItem("zv_eq_preset", name);
  };

  const reset = () => applyPreset("Flat");

  return (
    <div className="space-y-4">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(PRESETS).map((name) => (
          <button
            key={name}
            onClick={() => applyPreset(name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activePreset === name
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Bands */}
      <div className="flex items-end justify-between gap-3 h-48 px-2">
        {BANDS.map((band, i) => (
          <div key={band.freq} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-xs text-muted-foreground font-mono">
              {gains[i] > 0 ? "+" : ""}{gains[i]}dB
            </span>
            <div className="h-32 flex items-center">
              <Slider
                orientation="vertical"
                value={[gains[i]]}
                onValueChange={([v]) => handleBandChange(i, v)}
                min={-12}
                max={12}
                step={1}
                className="h-full"
              />
            </div>
            <span className="text-xs text-muted-foreground">{band.label}</span>
          </div>
        ))}
      </div>

      {/* Reset */}
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={reset} className="text-xs gap-1.5">
          <RotateCcw className="w-3 h-3" /> Reset
        </Button>
      </div>
    </div>
  );
};
