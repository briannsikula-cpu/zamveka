import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sun, Moon, Volume2, Bell, Shield, LogOut,
  User, Music, Eye, EyeOff, ChevronRight, Palette,
  SkipForward, ListMusic, Heart, Timer, Gauge,
  Headphones, Radio, Vibrate, Globe, SlidersHorizontal,
  Mic2, FileAudio, Download, Wifi, WifiOff, Zap
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/contexts/PlayerContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { MiniPlayer } from "@/components/MiniPlayer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Equalizer } from "@/components/Equalizer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow = ({ icon, label, description, children }: SettingRowProps) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <div className="text-primary shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
      </div>
    </div>
    <div className="shrink-0 ml-3">{children}</div>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-lg font-bold mb-3 mt-6 first:mt-0">{title}</h2>
);

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { currentSong, isPlaying, togglePlay, volume, setVolume } = usePlayer();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [eqOpen, setEqOpen] = useState(false);

  // Persisted settings
  const [autoplay, setAutoplay] = useState(() => localStorage.getItem("zv_autoplay") !== "false");
  const [crossfade, setCrossfade] = useState(() => localStorage.getItem("zv_crossfade") === "true");
  const [crossfadeDuration, setCrossfadeDuration] = useState(() => parseInt(localStorage.getItem("zv_crossfade_dur") || "5"));
  const [gapless, setGapless] = useState(() => localStorage.getItem("zv_gapless") !== "false");
  const [notifications, setNotifications] = useState(() => localStorage.getItem("zv_notifications") !== "false");
  const [newReleaseAlerts, setNewReleaseAlerts] = useState(() => localStorage.getItem("zv_new_release") !== "false");
  const [followerAlerts, setFollowerAlerts] = useState(() => localStorage.getItem("zv_follower_alerts") !== "false");
  const [explicitContent, setExplicitContent] = useState(() => localStorage.getItem("zv_explicit") !== "false");
  const [privateSession, setPrivateSession] = useState(() => localStorage.getItem("zv_private") === "true");
  const [showLyrics, setShowLyrics] = useState(() => localStorage.getItem("zv_lyrics") !== "false");
  const [normalizeVolume, setNormalizeVolume] = useState(() => localStorage.getItem("zv_normalize") === "true");
  const [highQuality, setHighQuality] = useState(() => localStorage.getItem("zv_hq") === "true");
  const [offlineMode, setOfflineMode] = useState(() => localStorage.getItem("zv_offline") === "true");
  const [sleepTimer, setSleepTimer] = useState(() => localStorage.getItem("zv_sleep") || "off");
  const [streamOverData, setStreamOverData] = useState(() => localStorage.getItem("zv_data_stream") !== "false");

  useEffect(() => { setMounted(true); }, []);

  const persist = (key: string, val: boolean | string | number) => localStorage.setItem(key, String(val));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen pb-32">
      <div className="pt-6 px-4 max-w-lg mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-2"
        >
          Settings
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-4">Customize your music experience</p>

        {/* ── Appearance ── */}
        <SectionTitle title="Appearance" />
        <GlassCard className="p-4" hover={false}>
          <SettingRow icon={<Palette className="w-5 h-5" />} label="Theme" description="Switch between light and dark mode">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
              <Moon className="w-4 h-4 text-muted-foreground" />
            </div>
          </SettingRow>
        </GlassCard>

        {/* ── Audio & Playback ── */}
        <SectionTitle title="Audio & Playback" />
        <GlassCard className="p-4" hover={false}>
          <SettingRow icon={<Volume2 className="w-5 h-5" />} label="Volume" description={`${Math.round(volume * 100)}%`}>
            <div className="w-28">
              <Slider value={[volume * 100]} onValueChange={([v]) => setVolume(v / 100)} max={100} step={1} />
            </div>
          </SettingRow>
          <Separator className="my-1" />

          <SettingRow icon={<Gauge className="w-5 h-5" />} label="Normalize volume" description="Keep volume level consistent">
            <Switch checked={normalizeVolume} onCheckedChange={(v) => { setNormalizeVolume(v); persist("zv_normalize", v); }} />
          </SettingRow>
          <Separator className="my-1" />

          <SettingRow icon={<SkipForward className="w-5 h-5" />} label="Autoplay" description="Play similar songs when queue ends">
            <Switch checked={autoplay} onCheckedChange={(v) => { setAutoplay(v); persist("zv_autoplay", v); }} />
          </SettingRow>
          <Separator className="my-1" />

          <SettingRow icon={<Music className="w-5 h-5" />} label="Crossfade" description="Smooth transitions between tracks">
            <Switch checked={crossfade} onCheckedChange={(v) => { setCrossfade(v); persist("zv_crossfade", v); }} />
          </SettingRow>
          {crossfade && (
            <SettingRow icon={<Timer className="w-5 h-5" />} label="Crossfade duration" description={`${crossfadeDuration}s`}>
              <div className="w-24">
                <Slider value={[crossfadeDuration]} onValueChange={([v]) => { setCrossfadeDuration(v); persist("zv_crossfade_dur", v); }} min={1} max={12} step={1} />
              </div>
            </SettingRow>
          )}
          <Separator className="my-1" />

          <SettingRow icon={<ListMusic className="w-5 h-5" />} label="Gapless playback" description="No silence between tracks">
            <Switch checked={gapless} onCheckedChange={(v) => { setGapless(v); persist("zv_gapless", v); }} />
          </SettingRow>
          <Separator className="my-1" />

          <SettingRow icon={<Eye className="w-5 h-5" />} label="Show lyrics" description="Display lyrics during playback">
            <Switch checked={showLyrics} onCheckedChange={(v) => { setShowLyrics(v); persist("zv_lyrics", v); }} />
          </SettingRow>
          <Separator className="my-1" />

          <SettingRow icon={<Headphones className="w-5 h-5" />} label="High quality audio" description="Stream at higher bitrate">
            <Switch checked={highQuality} onCheckedChange={(v) => { setHighQuality(v); persist("zv_hq", v); }} />
          </SettingRow>
        </GlassCard>

        {/* ── Equalizer ── */}
        <SectionTitle title="Equalizer" />
        <GlassCard className="p-4" hover={false}>
          <Collapsible open={eqOpen} onOpenChange={setEqOpen}>
            <CollapsibleTrigger className="w-full">
              <SettingRow icon={<SlidersHorizontal className="w-5 h-5" />} label="Equalizer" description="Customize sound profile">
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${eqOpen ? "rotate-90" : ""}`} />
              </SettingRow>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2">
                <Equalizer />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </GlassCard>

        {/* ── Sleep Timer ── */}
        <SectionTitle title="Sleep Timer" />
        <GlassCard className="p-4" hover={false}>
          <SettingRow icon={<Timer className="w-5 h-5" />} label="Sleep timer" description="Stop playback after a duration">
            <select
              value={sleepTimer}
              onChange={(e) => { setSleepTimer(e.target.value); persist("zv_sleep", e.target.value); toast.success(e.target.value === "off" ? "Sleep timer off" : `Sleep timer: ${e.target.value}`); }}
              className="bg-muted text-foreground text-xs rounded-lg px-2 py-1.5 border-none outline-none"
            >
              <option value="off">Off</option>
              <option value="15 min">15 min</option>
              <option value="30 min">30 min</option>
              <option value="45 min">45 min</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
            </select>
          </SettingRow>
        </GlassCard>

        {/* ── Streaming & Data ── */}
        <SectionTitle title="Streaming & Data" />
        <GlassCard className="p-4" hover={false}>
          <SettingRow icon={<Wifi className="w-5 h-5" />} label="Stream over cellular" description="Use mobile data for streaming">
            <Switch checked={streamOverData} onCheckedChange={(v) => { setStreamOverData(v); persist("zv_data_stream", v); }} />
          </SettingRow>
          <Separator className="my-1" />
          <SettingRow icon={<Download className="w-5 h-5" />} label="Offline mode" description="Only play downloaded music">
            <Switch checked={offlineMode} onCheckedChange={(v) => { setOfflineMode(v); persist("zv_offline", v); }} />
          </SettingRow>
        </GlassCard>

        {/* ── Notifications ── */}
        <SectionTitle title="Notifications" />
        <GlassCard className="p-4" hover={false}>
          <SettingRow icon={<Bell className="w-5 h-5" />} label="Push notifications" description="Get notified about activity">
            <Switch checked={notifications} onCheckedChange={(v) => { setNotifications(v); persist("zv_notifications", v); }} />
          </SettingRow>
          <Separator className="my-1" />
          <SettingRow icon={<Heart className="w-5 h-5" />} label="New release alerts" description="When followed artists drop music">
            <Switch checked={newReleaseAlerts} onCheckedChange={(v) => { setNewReleaseAlerts(v); persist("zv_new_release", v); }} />
          </SettingRow>
          <Separator className="my-1" />
          <SettingRow icon={<User className="w-5 h-5" />} label="Follower alerts" description="When someone follows you">
            <Switch checked={followerAlerts} onCheckedChange={(v) => { setFollowerAlerts(v); persist("zv_follower_alerts", v); }} />
          </SettingRow>
        </GlassCard>

        {/* ── Content & Privacy ── */}
        <SectionTitle title="Content & Privacy" />
        <GlassCard className="p-4" hover={false}>
          <SettingRow icon={<Shield className="w-5 h-5" />} label="Explicit content" description="Allow songs with explicit lyrics">
            <Switch checked={explicitContent} onCheckedChange={(v) => { setExplicitContent(v); persist("zv_explicit", v); }} />
          </SettingRow>
          <Separator className="my-1" />
          <SettingRow icon={<EyeOff className="w-5 h-5" />} label="Private session" description="Hide your listening activity">
            <Switch checked={privateSession} onCheckedChange={(v) => { setPrivateSession(v); persist("zv_private", v); }} />
          </SettingRow>
        </GlassCard>

        {/* ── Account ── */}
        <SectionTitle title="Account" />
        <GlassCard className="p-4" hover={false}>
          <SettingRow icon={<User className="w-5 h-5" />} label="Email" description={user?.email || "Not signed in"}>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </SettingRow>
          <Separator className="my-1" />
          <SettingRow icon={<User className="w-5 h-5" />} label="Edit profile" description="Change display name and avatar">
            <button onClick={() => navigate("/profile")} className="text-primary text-sm font-medium">Go</button>
          </SettingRow>
          <Separator className="my-1" />
          {user && (
            <div className="py-3">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 text-destructive hover:opacity-80 transition-opacity w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </div>
          )}
        </GlassCard>

        {/* ── About ── */}
        <SectionTitle title="About" />
        <GlassCard className="p-4" hover={false}>
          <SettingRow icon={<Music className="w-5 h-5" />} label="Version" description="ZAMVEKA v1.0.0">
            <span className="text-xs text-muted-foreground">1.0.0</span>
          </SettingRow>
          <Separator className="my-1" />
          <SettingRow icon={<Shield className="w-5 h-5" />} label="Privacy policy" description="">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </SettingRow>
          <Separator className="my-1" />
          <SettingRow icon={<Shield className="w-5 h-5" />} label="Terms of service" description="">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </SettingRow>
        </GlassCard>

        <div className="h-8" />
      </div>

      {currentSong && (
        <MiniPlayer song={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay} />
      )}
      <BottomNav />
    </div>
  );
};

export default Settings;
