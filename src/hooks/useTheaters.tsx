import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Theater {
  id: string;
  name: string;
  location: string;
  city: string;
  amenities: string[];
  created_at: string;
}

export interface Showtime {
  id: string;
  movie_id: string;
  theater_id: string;
  show_date: string;
  show_time: string;
  available_seats: number;
  price: number;
  created_at: string;
  theaters: Theater;
}

export const useTheaters = () => {
  return useQuery({
    queryKey: ["theaters"],
    queryFn: async (): Promise<Theater[]> => {
      const { data, error } = await supabase
        .from("theaters")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

export const useShowtimes = (movieId: string, date: string) => {
  return useQuery({
    queryKey: ["showtimes", movieId, date],
    queryFn: async (): Promise<Showtime[]> => {
      const { data, error } = await supabase
        .from("showtimes")
        .select(`
          *,
          theaters (*)
        `)
        .eq("movie_id", movieId)
        .eq("show_date", date)
        .gt("available_seats", 0)
        .order("show_time");

      if (error) throw error;
      return data as Showtime[];
    },
    enabled: !!movieId && !!date,
  });
};
