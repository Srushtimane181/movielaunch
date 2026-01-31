import { useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import { Movie } from "@/hooks/useMovies";
import { useCreateBooking } from "@/hooks/useBookings";
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
import { Calendar, Clock, Users, Loader2, MapPin, Sparkles, Armchair, Film, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SeatMap from "./SeatMap";
import PaymentForm from "./PaymentForm";
import BookingReceipt from "./BookingReceipt";

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
  const [step, setStep] = useState<"select-seats" | "select-showtime" | "seat-map" | "payment" | "success">("select-seats");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [seatCount, setSeatCount] = useState(2);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createBooking = useCreateBooking();

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
  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

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
    setSelectedSeats([]);
    setStep("seat-map");
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

  const handleProceedToPayment = () => {
    if (!selectedShowtime || selectedSeats.length !== seatCount) {
      toast({
        title: "Select Seats",
        description: `Please select exactly ${seatCount} seat(s).`,
        variant: "destructive",
      });
      return;
    }
    setStep("payment");
  };

  const handlePaymentComplete = async () => {
    if (!selectedShowtime || !user) return;

    try {
      // Use atomic database function to prevent race conditions and double-booking
      const { data: bookingIdResult, error } = await supabase.rpc('book_seats_atomic', {
        p_user_id: user.id,
        p_showtime_id: selectedShowtime.id,
        p_seat_numbers: selectedSeats,
        p_movie_id: movie.id,
        p_total_price: totalPrice,
        p_show_date: format(selectedDate, "yyyy-MM-dd"),
        p_show_time: selectedShowtime.show_time,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already booked')) {
          toast({
            title: "Seats No Longer Available",
            description: "One or more selected seats were just booked by another user. Please select different seats.",
            variant: "destructive",
          });
          setSelectedSeats([]);
          setStep("seat-map");
          return;
        }
        throw error;
      }

      setBookingId(bookingIdResult);
      
      toast({
        title: "📧 Booking Confirmed!",
        description: "A confirmation email has been sent to your registered email address.",
      });
      
      setStep("success");
    } catch (err) {
      console.error("Booking error:", err);
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("select-seats");
      setSelectedShowtime(null);
      setSeatCount(2);
      setSelectedSeats([]);
      setBookingId(null);
      setIsProcessing(false);
      setSelectedDate(new Date());
    }, 300);
  };

  const formatShowTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const availableSeatsCount = seats?.filter((s) => !s.is_booked).length || 0;

  const getStepTitle = () => {
    switch (step) {
      case "select-seats":
        return `Book Tickets - ${movie.title}`;
      case "select-showtime":
        return "Select Date & Showtime";
      case "seat-map":
        return "Select Your Seats";
      case "payment":
        return "Complete Payment";
      case "success":
        return "Booking Confirmed!";
      default:
        return movie.title;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl text-card-foreground">
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Number of Seats */}
        {step === "select-seats" && (
          <div className="space-y-6">
            {/* Movie Info */}
            <div className="flex items-start gap-4 rounded-lg bg-secondary/50 p-4">
              {movie.poster_url && (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="h-24 w-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground">{movie.title}</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {movie.genres?.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {movie.duration} • {movie.language}
                </p>
              </div>
            </div>

            {/* Seats Count Selection */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Users className="h-4 w-4 text-primary" />
                How many seats?
              </label>
              <div className="flex items-center justify-center gap-4 rounded-lg bg-secondary/30 p-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full text-xl"
                  onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                  disabled={seatCount <= 1}
                >
                  -
                </Button>
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-bold text-primary">{seatCount}</span>
                  <span className="text-sm text-muted-foreground">
                    {seatCount === 1 ? "Seat" : "Seats"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full text-xl"
                  onClick={() => setSeatCount(Math.min(10, seatCount + 1))}
                  disabled={seatCount >= 10}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Quick Select Options */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setSeatCount(num)}
                  className={`h-10 w-10 rounded-full text-sm font-medium transition-all ${
                    seatCount === num
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep("select-showtime")}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Select Date & Showtime
            </Button>
          </div>
        )}

        {/* Step 2: Select Date and Showtime */}
        {step === "select-showtime" && (
          <div className="space-y-6">
            {/* Booking Summary Bar */}
            <div className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <Armchair className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-card-foreground">
                  {seatCount} {seatCount === 1 ? "Seat" : "Seats"} Selected
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("select-seats")}
                className="text-xs text-primary hover:text-primary/80"
              >
                Change
              </Button>
            </div>

            {/* Horizontal Date Selection */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Select Date
              </label>
              <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                <div className="flex gap-2 pb-3">
                  {dates.map((date, index) => {
                    const isSelected = format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
                    const isToday = index === 0;
                    
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex min-w-[72px] flex-col items-center rounded-xl border-2 p-3 transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-secondary/50"
                        }`}
                      >
                        <span className={`text-[10px] uppercase tracking-wider ${isSelected ? "text-primary-foreground/80" : ""}`}>
                          {isToday ? "Today" : format(date, "EEE")}
                        </span>
                        <span className="text-2xl font-bold">{format(date, "d")}</span>
                        <span className={`text-xs ${isSelected ? "text-primary-foreground/80" : ""}`}>
                          {format(date, "MMM")}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" className="h-2" />
              </ScrollArea>
            </div>

            {/* Theaters and Showtimes */}
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-card-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Theaters & Showtimes
              </h2>

              {isLoadingShowtimes ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-border p-4">
                      <Skeleton className="mb-2 h-5 w-48" />
                      <Skeleton className="mb-4 h-4 w-32" />
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((j) => (
                          <Skeleton key={j} className="h-12 w-24 rounded-lg" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : theaterShowtimes.length === 0 ? (
                <div className="rounded-xl border border-border bg-secondary/30 p-8 text-center">
                  <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium text-card-foreground">No showtimes available</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try selecting a different date
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {theaterShowtimes.map(({ theater, showtimes }) => (
                    <div
                      key={theater.id}
                      className="rounded-xl border border-border bg-secondary/20 p-4 transition-all hover:bg-secondary/40"
                    >
                      <div className="mb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-card-foreground">
                              {theater.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{theater.location}</p>
                          </div>
                        </div>
                        {theater.amenities && theater.amenities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {theater.amenities.map((amenity) => (
                              <span
                                key={amenity}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                              >
                                <Sparkles className="h-2.5 w-2.5" />
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
                            className="group flex flex-col items-center rounded-lg border-2 border-green-500/30 bg-background px-4 py-2 transition-all hover:border-green-500 hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/20"
                          >
                            <span className="text-sm font-semibold text-green-500 group-hover:text-white">
                              {formatShowTime(showtime.show_time)}
                            </span>
                            <span className="text-[10px] text-muted-foreground group-hover:text-white/80">
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

            <Button
              variant="outline"
              onClick={() => setStep("select-seats")}
              className="w-full"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        )}

        {/* Step 3: Seat Map */}
        {step === "seat-map" && selectedShowtime && (
          <div className="space-y-6">
            {/* Booking Info Bar */}
            <div className="rounded-lg bg-secondary p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-card-foreground">{selectedShowtime.theaters.name}</span>
                  <span className="text-border">•</span>
                  <span className="text-muted-foreground">{format(selectedDate, "EEE, MMM d")}</span>
                  <span className="text-border">•</span>
                  <span className="text-muted-foreground">{formatShowTime(selectedShowtime.show_time)}</span>
                </div>
                <span className="text-xs text-green-500">
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
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {selectedSeats.length}/{seatCount} seats × ₹{selectedShowtime.price}
                </span>
                <span className="text-2xl font-bold text-primary">
                  ₹{selectedShowtime.price * selectedSeats.length}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("select-showtime")} className="flex-1">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleProceedToPayment}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={selectedSeats.length !== seatCount}
              >
                Proceed to Payment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === "payment" && selectedShowtime && (
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Film className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-1 text-sm">
                  <h4 className="font-semibold text-card-foreground">{movie.title}</h4>
                  <p className="text-muted-foreground">
                    {selectedShowtime.theaters.name} • {format(selectedDate, "EEE, MMM d")} • {formatShowTime(selectedShowtime.show_time)}
                  </p>
                  <p className="text-muted-foreground">
                    Seats: {selectedSeats.sort().join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <PaymentForm
              totalAmount={totalPrice}
              onPaymentComplete={handlePaymentComplete}
              onBack={() => setStep("seat-map")}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </div>
        )}

        {/* Step 5: Success */}
        {step === "success" && selectedShowtime && bookingId && (
          <BookingReceipt
            movieTitle={movie.title}
            theaterName={selectedShowtime.theaters.name}
            theaterLocation={selectedShowtime.theaters.location}
            showDate={selectedDate}
            showTime={selectedShowtime.show_time}
            seats={selectedSeats}
            totalAmount={totalPrice}
            bookingId={bookingId}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
