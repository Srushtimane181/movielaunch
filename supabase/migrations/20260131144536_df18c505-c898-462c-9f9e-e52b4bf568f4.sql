-- Fix handle_new_user() function to add input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Sanitize and validate full_name from user metadata
  v_full_name := TRIM(COALESCE(new.raw_user_meta_data ->> 'full_name', ''));
  
  -- Limit length to prevent storage abuse (200 chars max)
  IF LENGTH(v_full_name) > 200 THEN
    v_full_name := SUBSTRING(v_full_name, 1, 200);
  END IF;
  
  -- Only insert if user ID is valid
  IF new.id IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name)
    VALUES (new.id, v_full_name)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$;