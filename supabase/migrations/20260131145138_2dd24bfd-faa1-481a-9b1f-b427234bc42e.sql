-- Add DELETE policy for profiles table for GDPR compliance
-- Allows users to delete their own profile if needed for account closure
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- Add DELETE policy for user_preferences table
-- Allows users to delete their own preferences
CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);