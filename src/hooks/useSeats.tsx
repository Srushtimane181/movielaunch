import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Seat {
  id: string;
  showtime_id: string;
  seat_number: string;
  booking_id: string | null;
  is_booked: boolean;
  created_at: string;
}

export const useShowtimeSeats = (showtimeId: string) => {
  return useQuery({
    queryKey: ["showtime-seats", showtimeId],
    queryFn: async (): Promise<Seat[]> => {
      const { data, error } = await supabase
        .from("showtime_seats")
        .select("*")
        .eq("showtime_id", showtimeId)
        .order("seat_number");

      if (error) throw error;
      return data;
    },
    enabled: !!showtimeId,
  });
};
