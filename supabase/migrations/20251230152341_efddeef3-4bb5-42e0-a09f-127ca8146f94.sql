-- Create theaters table
CREATE TABLE public.theaters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Mumbai',
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theaters ENABLE ROW LEVEL SECURITY;

-- Anyone can view theaters
CREATE POLICY "Anyone can view theaters" ON public.theaters FOR SELECT USING (true);

-- Create showtimes table linking movies to theaters
CREATE TABLE public.showtimes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  theater_id UUID NOT NULL REFERENCES public.theaters(id) ON DELETE CASCADE,
  show_date DATE NOT NULL,
  show_time TIME NOT NULL,
  available_seats INTEGER NOT NULL DEFAULT 100,
  price NUMERIC NOT NULL DEFAULT 250.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;

-- Anyone can view showtimes
CREATE POLICY "Anyone can view showtimes" ON public.showtimes FOR SELECT USING (true);

-- Seed theaters
INSERT INTO public.theaters (name, location, city, amenities) VALUES
  ('PVR Cinemas', 'Phoenix Mall, Lower Parel', 'Mumbai', ARRAY['Dolby Atmos', 'IMAX', 'Recliner Seats']),
  ('INOX', 'R-City Mall, Ghatkopar', 'Mumbai', ARRAY['4DX', 'Dolby Atmos', 'Food Court']),
  ('Cinepolis', 'Viviana Mall, Thane', 'Mumbai', ARRAY['VIP Lounge', 'IMAX', 'Parking']),
  ('Carnival Cinemas', 'Andheri West', 'Mumbai', ARRAY['Dolby Sound', 'Snack Bar']),
  ('MovieMax', 'Sion', 'Mumbai', ARRAY['Affordable', 'Classic Experience']);

-- Seed showtimes for all movies across theaters
DO $$
DECLARE
  movie_rec RECORD;
  theater_rec RECORD;
  show_dates DATE[] := ARRAY[CURRENT_DATE, CURRENT_DATE + 1, CURRENT_DATE + 2];
  show_times TIME[] := ARRAY['10:00', '13:30', '17:00', '20:30', '23:00']::TIME[];
  d DATE;
  t TIME;
BEGIN
  FOR movie_rec IN SELECT id FROM public.movies LOOP
    FOR theater_rec IN SELECT id FROM public.theaters LOOP
      FOREACH d IN ARRAY show_dates LOOP
        FOREACH t IN ARRAY show_times LOOP
          INSERT INTO public.showtimes (movie_id, theater_id, show_date, show_time, available_seats, price)
          VALUES (movie_rec.id, theater_rec.id, d, t, 100, 250 + (random() * 150)::INTEGER);
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Enable realtime for showtimes
ALTER PUBLICATION supabase_realtime ADD TABLE public.showtimes;