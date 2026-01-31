-- Create an atomic seat booking function to prevent race conditions
CREATE OR REPLACE FUNCTION public.book_seats_atomic(
  p_user_id UUID,
  p_showtime_id UUID,
  p_seat_numbers TEXT[],
  p_movie_id UUID,
  p_total_price NUMERIC,
  p_show_date DATE,
  p_show_time TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_booking_id UUID;
  v_conflict_count INTEGER;
BEGIN
  -- Lock the seats we want to book and check if any are already booked
  SELECT COUNT(*) INTO v_conflict_count
  FROM showtime_seats
  WHERE showtime_id = p_showtime_id
    AND seat_number = ANY(p_seat_numbers)
    AND is_booked = true
  FOR UPDATE;
  
  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'One or more seats are already booked';
  END IF;
  
  -- Also verify all requested seats exist
  IF (SELECT COUNT(*) FROM showtime_seats WHERE showtime_id = p_showtime_id AND seat_number = ANY(p_seat_numbers)) != array_length(p_seat_numbers, 1) THEN
    RAISE EXCEPTION 'One or more seats do not exist';
  END IF;
  
  -- Create booking with status 'paid'
  INSERT INTO bookings (user_id, movie_id, seats, total_price, show_date, show_time, status, booked_seats)
  VALUES (p_user_id, p_movie_id, array_length(p_seat_numbers, 1), p_total_price, p_show_date, p_show_time, 'paid', p_seat_numbers)
  RETURNING id INTO v_booking_id;
  
  -- Mark seats as booked atomically
  UPDATE showtime_seats
  SET is_booked = true, booking_id = v_booking_id
  WHERE showtime_id = p_showtime_id
    AND seat_number = ANY(p_seat_numbers);
  
  RETURN v_booking_id;
END;
$$;

-- Add a partial unique index to prevent double bookings at database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_showtime_seats_unique_booked 
ON showtime_seats (showtime_id, seat_number) 
WHERE is_booked = true;