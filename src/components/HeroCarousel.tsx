import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeaturedMovies, Movie } from "@/hooks/useMovies";
import { Skeleton } from "@/components/ui/skeleton";
import BookingDialog from "./BookingDialog";

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const { data: featuredMovies, isLoading } = useFeaturedMovies();

  const nextSlide = useCallback(() => {
    if (!featuredMovies?.length) return;
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  }, [featuredMovies?.length]);

  const prevSlide = useCallback(() => {
    if (!featuredMovies?.length) return;
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  }, [featuredMovies?.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying || !featuredMovies?.length) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, featuredMovies?.length]);

  const handleBookNow = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowBookingDialog(true);
  };

  if (isLoading) {
    return (
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden md:h-[70vh]">
        <Skeleton className="h-full w-full" />
      </section>
    );
  }

  if (!featuredMovies?.length) {
    return null;
  }

  const currentMovie = featuredMovies[currentIndex];

  return (
    <>
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden md:h-[70vh]">
        {/* Background Images */}
        {featuredMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${movie.backdrop_url || movie.poster_url})` }}
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="container relative z-10 flex h-full items-end px-4 pb-12 md:items-center md:pb-0">
          <div className="max-w-2xl animate-fade-in">
            {/* Genre Tags */}
            <div className="mb-4 flex flex-wrap gap-2">
              {currentMovie.genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-5xl lg:text-6xl">
              {currentMovie.title}
            </h1>

            {/* Description */}
            <p className="mb-6 line-clamp-2 text-sm text-muted-foreground md:text-base lg:text-lg">
              {currentMovie.description}
            </p>

            {/* Meta Info */}
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-bms-gold">★</span>
                <span className="font-semibold text-foreground">{currentMovie.rating}/10</span>
              </span>
              <span>•</span>
              <span>{currentMovie.duration}</span>
              <span>•</span>
              <span>{currentMovie.language}</span>
              <span>•</span>
              <span>{currentMovie.release_date}</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => handleBookNow(currentMovie)}
                className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-primary/90"
              >
                Book Tickets
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-border bg-background/20 text-foreground backdrop-blur-sm hover:bg-background/40"
              >
                <Play className="mr-2 h-4 w-4 fill-current" />
                Watch Trailer
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-background/20 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background/40 md:block"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-background/20 p-2 text-foreground backdrop-blur-sm transition-colors hover:bg-background/40 md:block"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {selectedMovie && (
        <BookingDialog
          movie={selectedMovie}
          open={showBookingDialog}
          onOpenChange={setShowBookingDialog}
        />
      )}
    </>
  );
};

export default HeroCarousel;
