import { useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import { Movie } from "@/hooks/useMovies";
import { useCreateBooking, useProcessPayment } from "@/hooks/useBookings";
import { useShowtimes, Showtime } from "@/hooks/useTheaters";
import { useShowtimeSeats } from "@/hooks/useSeats";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, CreditCard, Check, Loader2, MapPin, Sparkles, Armchair } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import SeatMap from "./SeatMap";

interface BookingDialogProps {
  movie: Movie;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TheaterWithShowtimes {
  theater: {
    id: string;
    name: string;
    location: string;
    amenities: string[];
  };
  showtimes: Showtime[];
}

const BookingDialog = ({ movie, open, onOpenChange }: BookingDialogProps) => {
  const [step, setStep] = useState<"theater" | "seats-count" | "seat-select" | "payment" | "success">("theater");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seatCount, setSeatCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const processPayment = useProcessPayment();

  const { data: showtimes, isLoading: isLoadingShowtimes } = useShowtimes(
    movie.id,
    format(selectedDate, "yyyy-MM-dd")
  );

  const { data: seats, isLoading: isLoadingSeats } = useShowtimeSeats(
    selectedShowtime?.id || ""
  );

  // Group showtimes by theater
  const theaterShowtimes = useMemo((): TheaterWithShowtimes[] => {
    if (!showtimes) return [];

    const grouped = showtimes.reduce((acc, showtime) => {
      const theaterId = showtime.theater_id;
      if (!acc[theaterId]) {
        acc[theaterId] = {
          theater: showtime.theaters,
          showtimes: [],
        };
      }
      acc[theaterId].showtimes.push(showtime);
      return acc;
    }, {} as Record<string, TheaterWithShowtimes>);

    return Object.values(grouped);
  }, [showtimes]);

  const totalPrice = selectedShowtime ? selectedShowtime.price * seatCount : 0;

  const handleSelectShowtime = (showtime: Showtime) => {
    if (!user) {
      toast({
        title: "Please Sign In",
        description: "You need to sign in to book tickets.",
        variant: "destructive",
      });
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    setSelectedShowtime(showtime);
    setStep("seats-count");
  };

  const handleSeatCountConfirm = () => {
    setSelectedSeats([]);
    setStep("seat-select");
  };

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber);
      }
      if (prev.length < seatCount) {
        return [...prev, seatNumber];
      }
      return prev;
    });
  };

  const handleProceedToPayment = async () => {
    if (!selectedShowtime || selectedSeats.length !== seatCount) {
      toast({
        title: "Select Seats",
        description: `Please select exactly ${seatCount} seat(s).`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const booking = await createBooking.mutateAsync({
        movieId: movie.id,
        seats: seatCount,
        totalPrice,
        showDate: format(selectedDate, "yyyy-MM-dd"),
        showTime: selectedShowtime.show_time,
      });

      // Update the booked_seats in the booking
      await supabase
        .from("bookings")
        .update({ booked_seats: selectedSeats })
        .eq("id", booking.id);

      // Mark seats as booked in showtime_seats
      for (const seatNumber of selectedSeats) {
        await supabase
          .from("showtime_seats")
          .update({ is_booked: true, booking_id: booking.id })
          .eq("showtime_id", selectedShowtime.id)
          .eq("seat_number", seatNumber);
      }

      setBookingId(booking.id);
      setStep("payment");
    } catch {
      // Error handled in mutation
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!bookingId) return;

    setIsProcessing(true);

    try {
      await processPayment.mutateAsync(bookingId);
      setStep("success");
    } catch {
      // Error handled in mutation
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("theater");
      setSelectedShowtime(null);
      setSeatCount(1);
      setSelectedSeats([]);
      setBookingId(null);
    }, 300);
  };

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const formatShowTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const availableSeatsCount = seats?.filter((s) => !s.is_booked).length || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl text-card-foreground">
            {step === "success" ? "Booking Confirmed!" : `Book Tickets - ${movie.title}`}
          </DialogTitle>
        </DialogHeader>

        {step === "theater" && (
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Calendar className="h-4 w-4" />
                Select Date
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {dates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`flex min-w-[70px] flex-col items-center rounded-lg border p-3 transition-colors ${
                      format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xs">{format(date, "EEE")}</span>
                    <span className="text-lg font-semibold">{format(date, "d")}</span>
                    <span className="text-xs">{format(date, "MMM")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theaters and Showtimes */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-card-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Theaters Showing {movie.title}
              </h2>

              {isLoadingShowtimes ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-lg border border-border p-4">
                      <Skeleton className="mb-2 h-5 w-48" />
                      <Skeleton className="mb-4 h-4 w-32" />
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((j) => (
                          <Skeleton key={j} className="h-10 w-20" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : theaterShowtimes.length === 0 ? (
                <div className="rounded-lg border border-border bg-secondary/50 p-8 text-center">
                  <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No showtimes available for this date.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try selecting a different date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {theaterShowtimes.map(({ theater, showtimes }) => (
                    <div
                      key={theater.id}
                      className="rounded-lg border border-border bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
                    >
                      <div className="mb-3">
                        <h3 className="text-base font-semibold text-card-foreground">
                          {theater.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{theater.location}</p>
                        {theater.amenities && theater.amenities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {theater.amenities.map((amenity) => (
                              <span
                                key={amenity}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                              >
                                <Sparkles className="h-3 w-3" />
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {showtimes.map((showtime) => (
                          <button
                            key={showtime.id}
                            onClick={() => handleSelectShowtime(showtime)}
                            className="group rounded-lg border border-primary/30 bg-background px-4 py-2 text-sm font-medium text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <span className="block">{formatShowTime(showtime.show_time)}</span>
                            <span className="block text-xs opacity-70 group-hover:opacity-100">
                              ₹{showtime.price}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === "seats-count" && selectedShowtime && (
          <div className="space-y-6">
            {/* Selected Showtime Summary */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theater</span>
                  <span className="text-card-foreground">{selectedShowtime.theaters.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-card-foreground">
                    {format(selectedDate, "EEE, MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-card-foreground">
                    {formatShowTime(selectedShowtime.show_time)}
                  </span>
                </div>
              </div>
            </div>

            {/* Seats Count Selection */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Users className="h-4 w-4" />
                How many tickets?
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                  disabled={seatCount <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center text-lg font-semibold text-card-foreground">
                  {seatCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSeatCount(Math.min(10, seatCount + 1))}
                  disabled={seatCount >= 10}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Price Preview */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {seatCount} ticket{seatCount > 1 ? "s" : ""} × ₹{selectedShowtime.price}
                </span>
                <span className="text-xl font-bold text-card-foreground">₹{totalPrice}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("theater")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSeatCountConfirm}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Armchair className="mr-2 h-4 w-4" />
                Select Seats
              </Button>
            </div>
          </div>
        )}

        {step === "seat-select" && selectedShowtime && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="rounded-lg bg-secondary p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">{selectedShowtime.theaters.name}</span>
                  <span className="mx-2 text-border">|</span>
                  <span className="text-muted-foreground">{format(selectedDate, "EEE, MMM d")}</span>
                  <span className="mx-2 text-border">|</span>
                  <span className="text-muted-foreground">{formatShowTime(selectedShowtime.show_time)}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {availableSeatsCount} seats available
                </span>
              </div>
            </div>

            {/* Seat Map */}
            {isLoadingSeats ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : seats ? (
              <SeatMap
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                maxSeats={seatCount}
              />
            ) : null}

            {/* Price Summary */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""} × ₹{selectedShowtime.price}
                </span>
                <span className="text-xl font-bold text-card-foreground">
                  ₹{selectedShowtime.price * selectedSeats.length}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("seats-count")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleProceedToPayment}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isProcessing || selectedSeats.length !== seatCount}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}

        {step === "payment" && selectedShowtime && (
          <div className="space-y-6">
            <div className="rounded-lg bg-secondary p-4">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movie</span>
                  <span className="text-card-foreground">{movie.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theater</span>
                  <span className="text-card-foreground">{selectedShowtime.theaters.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-card-foreground">
                    {format(selectedDate, "EEE, MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-card-foreground">
                    {formatShowTime(selectedShowtime.show_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="text-card-foreground">{selectedSeats.sort().join(", ")}</span>
                </div>
                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="font-semibold text-card-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">₹{totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-2 text-sm font-medium text-card-foreground">
                Mock Payment (Demo)
              </h4>
              <p className="text-xs text-muted-foreground">
                This is a simulated payment. Click "Pay Now" to complete the mock transaction.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("seat-select")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{totalPrice}</>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && selectedShowtime && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
              <Check className="h-8 w-8 text-green-500" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-card-foreground">
                Payment Successful!
              </h3>
              <p className="mt-2 text-muted-foreground">
                Your tickets for {movie.title} have been booked successfully.
              </p>
            </div>

            <div className="rounded-lg bg-secondary p-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theater</span>
                  <span className="text-card-foreground">{selectedShowtime.theaters.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-card-foreground">
                    {format(selectedDate, "EEE, MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-card-foreground">
                    {formatShowTime(selectedShowtime.show_time)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="text-card-foreground">{selectedSeats.sort().join(", ")}</span>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
