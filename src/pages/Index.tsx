import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import MovieListings from "@/components/MovieListings";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroCarousel />
        <MovieListings />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
