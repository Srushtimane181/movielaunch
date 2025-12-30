import { format } from "date-fns";
import { Ticket, Calendar, Clock, MapPin, Armchair, Film, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingReceiptProps {
  movieTitle: string;
  theaterName: string;
  theaterLocation: string;
  showDate: Date;
  showTime: string;
  seats: string[];
  totalAmount: number;
  bookingId: string;
  onClose: () => void;
}

const BookingReceipt = ({
  movieTitle,
  theaterName,
  theaterLocation,
  showDate,
  showTime,
  seats,
  totalAmount,
  bookingId,
  onClose,
}: BookingReceiptProps) => {
  const formatShowTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Success Animation */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <Ticket className="h-10 w-10 text-green-500" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
            ✓
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-card-foreground">Booking Confirmed!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your tickets have been booked successfully
          </p>
        </div>
      </div>

      {/* Ticket Card */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-secondary/80 to-secondary">
        {/* Decorative elements */}
        <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-card" />
        <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-card" />
        <div className="absolute left-6 right-6 top-1/2 border-t border-dashed border-border" />

        {/* Top Section */}
        <div className="p-4 pb-8">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Film className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-card-foreground">{movieTitle}</h4>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(showDate, "EEE, MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatShowTime(showTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 pt-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Theater</p>
              <p className="flex items-center gap-1 text-sm font-medium text-card-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {theaterName}
              </p>
              <p className="text-xs text-muted-foreground">{theaterLocation}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seats</p>
              <p className="flex items-center gap-1 text-sm font-medium text-card-foreground">
                <Armchair className="h-3.5 w-3.5 text-primary" />
                {seats.sort().join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">{seats.length} ticket(s)</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Booking ID</p>
              <p className="font-mono text-sm font-medium text-card-foreground">
                {bookingId.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Amount Paid</p>
              <p className="text-xl font-bold text-primary">₹{totalAmount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Notification */}
      <div className="flex items-center gap-3 rounded-lg bg-green-500/10 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
          <span className="text-lg">📧</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-card-foreground">
            Confirmation email sent!
          </p>
          <p className="text-xs text-muted-foreground">
            Check your inbox for booking details and e-ticket
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Download Ticket
        </Button>
        <Button onClick={onClose} className="flex-1">
          Done
        </Button>
      </div>
    </div>
  );
};

export default BookingReceipt;
