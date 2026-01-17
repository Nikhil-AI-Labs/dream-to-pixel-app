-- Create storage buckets for file management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('screenshots', 'screenshots', false, 10485760, ARRAY['image/png', 'image/jpeg']),
  ('cookie-files', 'cookie-files', false, 52428800, ARRAY['text/plain', 'application/json', 'application/octet-stream']),
  ('exports', 'exports', false, 52428800, ARRAY['application/json', 'text/plain'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for screenshots bucket
CREATE POLICY "Users can upload own screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for cookie-files bucket
CREATE POLICY "Users can upload own cookie files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cookie-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own cookie files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cookie-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own cookie files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cookie-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own cookie files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cookie-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for exports bucket
CREATE POLICY "Users can upload own exports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own exports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own exports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automation_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.screenshots;