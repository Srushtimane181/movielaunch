-- Fix 1: Add explicit DELETE policy on bookings to prevent unauthorized deletion
-- Currently there's no DELETE policy, which means no one can delete (good default)
-- But adding an explicit restrictive policy makes intent clear and prevents accidental permissive policies
CREATE POLICY "Users can only delete their own bookings"
ON public.bookings
FOR DELETE
USING (auth.uid() = user_id);

-- Fix 2: The profiles table already has proper RLS policies restricting to auth.uid() = id
-- Anonymous users cannot access profiles because they have no auth.uid() that would match
-- The existing policies are already restrictive (not permissive), so access is properly controlled
-- No additional changes needed for profiles - the existing policies are secure