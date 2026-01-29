import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackCard } from "@/components/TrackCard";
import { TrendingUp, Play } from "lucide-react";
import { GradientButton } from "@/components/ui/GradientButton";

const allTracks = [
  { id: 1, title: "Against the Odds", artist: "Zeidah", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", plays: "125K", duration: "3:42" },
  { id: 2, title: "Midnight Dreams", artist: "Eli Njuchi", imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400", plays: "98K", duration: "4:15" },
  { id: 3, title: "Rise Up", artist: "Patience Namadingo", imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400", plays: "87K", duration: "3:58" },
  { id: 4, title: "Lilongwe Nights", artist: "Suffix", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400", plays: "76K", duration: "3:22" },
  { id: 5, title: "Golden Hour", artist: "Gwamba", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", plays: "65K", duration: "4:01" },
  { id: 6, title: "African Sunrise", artist: "Sangie", imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400", plays: "54K", duration: "3:35" },
  { id: 7, title: "Soul Fire", artist: "Faith Mussa", imageUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400", plays: "48K", duration: "3:28" },
  { id: 8, title: "City Lights", artist: "Tay Grin", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400", plays: "42K", duration: "3:55" },
  { id: 9, title: "Heartbeat", artist: "Lulu", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", plays: "38K", duration: "4:12" },
  { id: 10, title: "Blantyre Flow", artist: "Phyzix", imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400", plays: "35K", duration: "3:45" },
  { id: 11, title: "Moonlight", artist: "Kelvin Sings", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400", plays: "32K", duration: "3:18" },
  { id: 12, title: "New Dawn", artist: "Martse", imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400", plays: "29K", duration: "4:05" },
];

export default function Trending() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-28 pb-10">
        {/* Hero Banner */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-primary/25 blur-[150px]"
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="gradient-button p-4 rounded-2xl">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Trending Now</h1>
                  <p className="text-muted-foreground">The hottest tracks in Malawi this week</p>
                </div>
              </div>

              <GradientButton icon={<Play className="w-5 h-5 fill-current" />}>
                Play All
              </GradientButton>
            </motion.div>
          </div>
        </section>

        {/* Tracks Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
            >
              {allTracks.map((track, i) => (
                <motion.div
                  key={track.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <TrackCard {...track} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
