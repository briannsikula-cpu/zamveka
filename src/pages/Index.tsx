import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { TrendingSection } from "@/components/TrendingSection";
import { FeaturedArtists } from "@/components/FeaturedArtists";
import { useAuth } from "@/hooks/useAuth";
import { HomeLoggedIn } from "@/components/HomeLoggedIn";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <HomeLoggedIn />;
  }

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
