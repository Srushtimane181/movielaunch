export interface Movie {
  id: number;
  title: string;
  poster: string;
  backdrop: string;
  genres: string[];
  rating: number;
  releaseDate: string;
  duration: string;
  language: string;
  description: string;
  isFeatured?: boolean;
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Pushpa 2: The Rule",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=800&fit=crop",
    genres: ["Action", "Drama"],
    rating: 8.5,
    releaseDate: "Dec 5, 2024",
    duration: "3h 20m",
    language: "Telugu",
    description: "Pushpa Raj returns with more power and vengeance in this action-packed sequel.",
    isFeatured: true,
  },
  {
    id: 2,
    title: "Singham Again",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&h=800&fit=crop",
    genres: ["Action", "Thriller"],
    rating: 8.2,
    releaseDate: "Nov 1, 2024",
    duration: "2h 45m",
    language: "Hindi",
    description: "Bajirao Singham is back with the biggest action spectacle of the year.",
    isFeatured: true,
  },
  {
    id: 3,
    title: "Bhool Bhulaiyaa 3",
    poster: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=1920&h=800&fit=crop",
    genres: ["Horror", "Comedy"],
    rating: 7.8,
    releaseDate: "Nov 1, 2024",
    duration: "2h 38m",
    language: "Hindi",
    description: "The ultimate horror-comedy with spine-chilling twists and hilarious moments.",
    isFeatured: true,
  },
  {
    id: 4,
    title: "Amaran",
    poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=1920&h=800&fit=crop",
    genres: ["Action", "Biography"],
    rating: 9.0,
    releaseDate: "Oct 31, 2024",
    duration: "2h 49m",
    language: "Tamil",
    description: "A gripping story of bravery and sacrifice of an Indian Army officer.",
    isFeatured: true,
  },
  {
    id: 5,
    title: "Lucky Bhaskar",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&h=800&fit=crop",
    genres: ["Drama", "Thriller"],
    rating: 8.7,
    releaseDate: "Oct 31, 2024",
    duration: "2h 32m",
    language: "Telugu",
    description: "A common man's extraordinary journey through unexpected circumstances.",
    isFeatured: true,
  },
  {
    id: 6,
    title: "Vettaiyan",
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1920&h=800&fit=crop",
    genres: ["Action", "Crime"],
    rating: 7.5,
    releaseDate: "Oct 10, 2024",
    duration: "2h 45m",
    language: "Tamil",
    description: "A fierce hunter takes on the criminal underworld.",
  },
  {
    id: 7,
    title: "Meiyazhagan",
    poster: "https://images.unsplash.com/photo-1512070679279-8988d32161be?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1920&h=800&fit=crop",
    genres: ["Drama", "Family"],
    rating: 8.9,
    releaseDate: "Sep 27, 2024",
    duration: "2h 55m",
    language: "Tamil",
    description: "A heartwarming tale of family bonds and self-discovery.",
  },
  {
    id: 8,
    title: "Stree 2",
    poster: "https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1604975999044-188783d54fb3?w=1920&h=800&fit=crop",
    genres: ["Horror", "Comedy"],
    rating: 8.4,
    releaseDate: "Aug 15, 2024",
    duration: "2h 29m",
    language: "Hindi",
    description: "The legendary Stree returns with more scares and laughs.",
  },
  {
    id: 9,
    title: "Devara",
    poster: "https://images.unsplash.com/photo-1460881680093-7cc1a21e1e84?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1920&h=800&fit=crop",
    genres: ["Action", "Drama"],
    rating: 7.9,
    releaseDate: "Sep 27, 2024",
    duration: "2h 58m",
    language: "Telugu",
    description: "A saga of power, betrayal, and redemption on the high seas.",
  },
  {
    id: 10,
    title: "The Greatest of All Time",
    poster: "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=800&fit=crop",
    genres: ["Action", "Sci-Fi"],
    rating: 7.2,
    releaseDate: "Sep 5, 2024",
    duration: "3h 2m",
    language: "Tamil",
    description: "A thrilling sci-fi action adventure that spans across time.",
  },
];

export const featuredMovies = movies.filter((movie) => movie.isFeatured);
