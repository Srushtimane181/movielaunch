import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Booking {
  id: string;
  user_id: string;
  movie_id: string;
  seats: number;
  total_price: number;
  status: "pending" | "paid" | "cancelled" | "refunded";
  show_date: string;
  show_time: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithMovie extends Booking {
  movies: {
    title: string;
    poster_url: string | null;
    duration: string | null;
    language: string;
  };
}

export const useBookings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async (): Promise<BookingWithMovie[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          movies (
            title,
            poster_url,
            duration,
            language
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BookingWithMovie[];
    },
    enabled: !!user,
  });
};

interface CreateBookingParams {
  movieId: string;
  seats: number;
  totalPrice: number;
  showDate: string;
  showTime: string;
}

export const useCreateBooking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ movieId, seats, totalPrice, showDate, showTime }: CreateBookingParams) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          movie_id: movieId,
          seats,
          total_price: totalPrice,
          show_date: showDate,
          show_time: showTime,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "paid" })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      // Mock email notification via toast
      toast({
        title: "📧 Booking Confirmed!",
        description: "A confirmation email has been sent to your registered email address.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
