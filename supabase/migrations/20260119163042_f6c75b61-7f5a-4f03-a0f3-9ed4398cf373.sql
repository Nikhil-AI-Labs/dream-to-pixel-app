-- Add missing DELETE policies for proper user data management

-- Delete policy for accounts table
CREATE POLICY "Users can delete their own accounts"
ON public.accounts
FOR DELETE
USING (auth.uid() = user_id);

-- Delete policy for user_settings table
CREATE POLICY "Users can delete their own settings"
ON public.user_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Delete policy for automation_logs table
CREATE POLICY "Users can delete their own logs"
ON public.automation_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Delete policy for screenshots table
CREATE POLICY "Users can delete their own screenshots"
ON public.screenshots
FOR DELETE
USING (auth.uid() = user_id);

-- Delete policy for profiles table
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Delete policy for automation_sessions table
CREATE POLICY "Users can delete their own sessions"
ON public.automation_sessions
FOR DELETE
USING (auth.uid() = user_id);