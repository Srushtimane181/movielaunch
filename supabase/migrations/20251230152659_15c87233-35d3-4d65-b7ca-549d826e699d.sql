-- Add booked_seats column to bookings table to store selected seat numbers
ALTER TABLE public.bookings ADD COLUMN booked_seats TEXT[] DEFAULT '{}';

-- Create a table to track all booked seats per showtime for quick lookup
CREATE TABLE public.showtime_seats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  showtime_id UUID NOT NULL REFERENCES public.showtimes(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(showtime_id, seat_number)
);

-- Enable RLS
ALTER TABLE public.showtime_seats ENABLE ROW LEVEL SECURITY;

-- Anyone can view seat status
CREATE POLICY "Anyone can view seats" ON public.showtime_seats FOR SELECT USING (true);

-- Users can book seats (insert)
CREATE POLICY "Users can book seats" ON public.showtime_seats FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own booked seats
CREATE POLICY "Users can update booked seats" ON public.showtime_seats FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = showtime_seats.booking_id 
    AND bookings.user_id = auth.uid()
  )
);

-- Enable realtime for seat updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.showtime_seats;

-- Pre-populate seats for all showtimes (10 rows x 12 columns = 120 seats per theater)
-- We'll seed some as booked to simulate real usage
DO $$
DECLARE
  showtime_rec RECORD;
  row_letter CHAR;
  seat_num INTEGER;
  seat_id TEXT;
  random_booked BOOLEAN;
BEGIN
  FOR showtime_rec IN SELECT id FROM public.showtimes LOOP
    FOR row_letter IN SELECT chr(i) FROM generate_series(65, 74) AS i LOOP -- A to J (10 rows)
      FOR seat_num IN 1..12 LOOP -- 12 seats per row
        seat_id := row_letter || seat_num::TEXT;
        -- Randomly mark ~20% of seats as booked
        random_booked := random() < 0.2;
        INSERT INTO public.showtime_seats (showtime_id, seat_number, is_booked)
        VALUES (showtime_rec.id, seat_id, random_booked)
        ON CONFLICT (showtime_id, seat_number) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;