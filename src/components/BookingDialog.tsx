import { useState } from "react";
import { format, addDays } from "date-fns";
import { Movie } from "@/hooks/useMovies";
import { useCreateBooking, useProcessPayment } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, CreditCard, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingDialogProps {
  movie: Movie;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const showTimes = ["10:00 AM", "1:30 PM", "4:45 PM", "7:30 PM", "10:15 PM"];

const BookingDialog = ({ movie, open, onOpenChange }: BookingDialogProps) => {
  const [step, setStep] = useState<"select" | "payment" | "success">("select");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [seats, setSeats] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createBooking = useCreateBooking();
  const processPayment = useProcessPayment();

  const totalPrice = movie.price * seats;

  const handleProceedToPayment = async () => {
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

    if (!selectedTime) {
      toast({
        title: "Select Show Time",
        description: "Please select a show time to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const booking = await createBooking.mutateAsync({
        movieId: movie.id,
        seats,
        totalPrice,
        showDate: format(selectedDate, "yyyy-MM-dd"),
        showTime: selectedTime,
      });

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
    // Reset state after animation
    setTimeout(() => {
      setStep("select");
      setSelectedTime("");
      setSeats(1);
      setBookingId(null);
    }, 300);
  };

  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl text-card-foreground">
            {step === "success" ? "Booking Confirmed!" : `Book Tickets - ${movie.title}`}
          </DialogTitle>
        </DialogHeader>

        {step === "select" && (
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

            {/* Time Selection */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Clock className="h-4 w-4" />
                Select Show Time
              </label>
              <div className="flex flex-wrap gap-2">
                {showTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedTime === time
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Seats Selection */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-card-foreground">
                <Users className="h-4 w-4" />
                Number of Seats
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSeats(Math.max(1, seats - 1))}
                  disabled={seats <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center text-lg font-semibold text-card-foreground">
                  {seats}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSeats(Math.min(10, seats + 1))}
                  disabled={seats >= 10}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="rounded-lg bg-secondary p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {seats} seat{seats > 1 ? "s" : ""} × ₹{movie.price}
                </span>
                <span className="text-xl font-bold text-card-foreground">₹{totalPrice}</span>
              </div>
            </div>

            <Button
              onClick={handleProceedToPayment}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isProcessing || !selectedTime}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Proceed to Payment
            </Button>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-6">
            <div className="rounded-lg bg-secondary p-4">
              <h3 className="mb-4 text-lg font-semibold text-card-foreground">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Movie</span>
                  <span className="text-card-foreground">{movie.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-card-foreground">
                    {format(selectedDate, "EEE, MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-card-foreground">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="text-card-foreground">{seats}</span>
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
              <Button variant="outline" onClick={() => setStep("select")} className="flex-1">
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

        {step === "success" && (
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
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-card-foreground">
                    {format(selectedDate, "EEE, MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="text-card-foreground">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="text-card-foreground">{seats}</span>
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
