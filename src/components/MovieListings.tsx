import { ChevronRight } from "lucide-react";
import { useMovies } from "@/hooks/useMovies";
import MovieCard from "./MovieCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const MovieListings = () => {
  const { data: movies, isLoading, error } = useMovies();

  if (error) {
    return (
      <section className="py-12" id="movies">
        <div className="container px-4">
          <div className="text-center text-destructive">
            Failed to load movies. Please try again.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12" id="movies">
      <div className="container px-4">
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Now Showing</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Book tickets for the latest movies in theaters
            </p>
          </div>
          <Button
            variant="ghost"
            className="hidden items-center gap-1 text-primary hover:text-primary/80 sm:flex"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Movie Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
            {movies?.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Button
            variant="outline"
            className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            View All Movies
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MovieListings;
