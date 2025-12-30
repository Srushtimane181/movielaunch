import { useMemo } from "react";
import { Seat } from "@/hooks/useSeats";
import { Monitor } from "lucide-react";

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatSelect: (seatNumber: string) => void;
  maxSeats: number;
}

const SeatMap = ({ seats, selectedSeats, onSeatSelect, maxSeats }: SeatMapProps) => {
  // Organize seats into rows
  const seatRows = useMemo(() => {
    const rows: Record<string, Seat[]> = {};
    
    seats.forEach((seat) => {
      const rowLetter = seat.seat_number.charAt(0);
      if (!rows[rowLetter]) {
        rows[rowLetter] = [];
      }
      rows[rowLetter].push(seat);
    });

    // Sort seats within each row by number
    Object.keys(rows).forEach((row) => {
      rows[row].sort((a, b) => {
        const numA = parseInt(a.seat_number.slice(1));
        const numB = parseInt(b.seat_number.slice(1));
        return numA - numB;
      });
    });

    return rows;
  }, [seats]);

  const rowLetters = Object.keys(seatRows).sort();

  const handleSeatClick = (seat: Seat) => {
    if (seat.is_booked) return;
    
    const isSelected = selectedSeats.includes(seat.seat_number);
    
    if (isSelected) {
      onSeatSelect(seat.seat_number);
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect(seat.seat_number);
    }
  };

  return (
    <div className="space-y-4">
      {/* Screen */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-full max-w-md">
          <div className="h-2 rounded-t-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <Monitor className="h-4 w-4" />
            <span>SCREEN</span>
          </div>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex flex-col items-center gap-1.5 min-w-fit">
          {rowLetters.map((rowLetter) => (
            <div key={rowLetter} className="flex items-center gap-1">
              {/* Row Label */}
              <span className="w-6 text-center text-xs font-medium text-muted-foreground">
                {rowLetter}
              </span>
              
              {/* Seats */}
              <div className="flex gap-1">
                {seatRows[rowLetter].map((seat, index) => {
                  const isBooked = seat.is_booked;
                  const isSelected = selectedSeats.includes(seat.seat_number);
                  const seatNum = parseInt(seat.seat_number.slice(1));
                  
                  // Add aisle gap after seat 6
                  const hasAisle = index === 5;

                  return (
                    <div key={seat.id} className={`flex ${hasAisle ? "mr-4" : ""}`}>
                      <button
                        onClick={() => handleSeatClick(seat)}
                        disabled={isBooked}
                        className={`
                          flex h-7 w-7 items-center justify-center rounded text-xs font-medium
                          transition-all duration-200
                          ${isBooked 
                            ? "cursor-not-allowed bg-muted text-muted-foreground/50" 
                            : isSelected
                              ? "border-2 border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                              : "border-2 border-green-500 text-green-500 hover:bg-green-500/10"
                          }
                        `}
                        title={isBooked ? "Seat unavailable" : seat.seat_number}
                      >
                        {seatNum}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Row Label (right side) */}
              <span className="w-6 text-center text-xs font-medium text-muted-foreground">
                {rowLetter}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-green-500" />
          <span className="text-xs text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded border-2 border-primary bg-primary" />
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-muted" />
          <span className="text-xs text-muted-foreground">Unavailable</span>
        </div>
      </div>

      {/* Selection Info */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          Selected: {selectedSeats.length} / {maxSeats} seats
        </span>
        {selectedSeats.length > 0 && (
          <p className="mt-1 font-medium text-primary">
            {selectedSeats.sort().join(", ")}
          </p>
        )}
      </div>
    </div>
  );
};

export default SeatMap;
