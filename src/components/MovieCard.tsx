import { Star, Clock, Calendar, Globe } from "lucide-react";
import { Movie } from "@/data/movies";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Card className="group overflow-hidden border-border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Rating Badge */}
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-bms-gold text-bms-gold" />
          <span className="text-xs font-semibold text-foreground">{movie.rating}</span>
        </div>

        {/* Book Button on Hover */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
          <Button
            size="sm"
            className="rounded-full bg-primary px-6 text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Title */}
        <h3 className="mb-2 line-clamp-1 text-base font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {movie.title}
        </h3>

        {/* Genres */}
        <div className="mb-3 flex flex-wrap gap-1">
          {movie.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {movie.duration}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {movie.language}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {movie.releaseDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
