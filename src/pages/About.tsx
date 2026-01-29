import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Link } from "react-router-dom";
import { Music, Users, Globe, Mic2, Heart, Zap } from "lucide-react";

const features = [
  {
    icon: Music,
    title: "Stream & Download",
    description: "Access thousands of tracks from Malawian artists. Download for offline listening.",
  },
  {
    icon: Users,
    title: "Artist Community",
    description: "Join a growing community of local musicians. Connect, collaborate, and grow together.",
  },
  {
    icon: Globe,
    title: "100% Malawian",
    description: "Platform built exclusively for Malawian artists. Your music, your platform.",
  },
  {
    icon: Mic2,
    title: "Easy Uploads",
    description: "Artists can upload tracks directly. Simple process, instant publishing.",
  },
  {
    icon: Heart,
    title: "Fan Support",
    description: "Fans can show love and support their favorite artists directly.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Optimized streaming experience. Listen without interruptions.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-28 pb-10">
        {/* Hero */}
        <section className="relative py-16 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[150px]"
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6"
              >
                <Heart className="w-4 h-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Made in Malawi</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="text-foreground">About </span>
                <span className="gradient-text">ZAMVEKA</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                ZAMVEKA is a Malawian music streaming platform built to spotlight 
                upcoming and independent artists. Our mission is simple: give local talent 
                a digital stage to be heard, discovered, and supported.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                This platform is focused on Malawi only, ensuring that new artists have 
                a fair chance to grow without being overshadowed. ZAMVEKA is for creators, 
                fans, and the future of local music.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why ZAMVEKA?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Built by Malawians, for Malawians. Here's what makes us different.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <GlassCard className="h-full">
                    <div className="gradient-button w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <GlassCard className="text-center py-12 px-6" hover={false}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to share your music?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Join hundreds of Malawian artists already on ZAMVEKA. 
                  Apply today and start reaching new fans.
                </p>
                <Link to="/apply">
                  <GradientButton size="lg" icon={<Mic2 className="w-5 h-5" />}>
                    Apply as an Artist
                  </GradientButton>
                </Link>
              </motion.div>
            </GlassCard>
          </div>
        </section>

        {/* Credits */}
        <section className="py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              Platform designed and created by{" "}
              <span className="text-primary font-medium">Steve Kutama</span>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
