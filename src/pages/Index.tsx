import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { TrendingSection } from "@/components/TrendingSection";
import { FeaturedArtists } from "@/components/FeaturedArtists";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <TrendingSection />
        <FeaturedArtists />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
