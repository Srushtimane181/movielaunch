import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Seat {
  id: string;
  showtime_id: string;
  seat_number: string;
  is_booked: boolean;
  created_at: string;
  // booking_id intentionally excluded from query for privacy
}

export const useShowtimeSeats = (showtimeId: string) => {
  return useQuery({
    queryKey: ["showtime-seats", showtimeId],
    queryFn: async (): Promise<Seat[]> => {
      // Only select fields needed for UI - excludes booking_id for privacy
      const { data, error } = await supabase
        .from("showtime_seats")
        .select("id, showtime_id, seat_number, is_booked, created_at")
        .eq("showtime_id", showtimeId)
        .order("seat_number");
      if (error) throw error;
      return data;
    },
    enabled: !!showtimeId,
  });
};
