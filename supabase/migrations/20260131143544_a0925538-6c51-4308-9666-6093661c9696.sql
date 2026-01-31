-- Remove the overly permissive INSERT policy on showtime_seats
-- Seats should be pre-populated by system/admin, not created by users directly
-- The book_seats_atomic function only UPDATEs existing seats, it doesn't INSERT
DROP POLICY IF EXISTS "Users can book seats" ON public.showtime_seats;