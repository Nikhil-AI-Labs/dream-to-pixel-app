-- Accounts table for Google account management
CREATE TABLE public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  notebook_url TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'INACTIVE',
  cookie_file_path TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, email)
);

-- User settings table
CREATE TABLE public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  api_keys JSONB DEFAULT '{}',
  automation_config JSONB DEFAULT '{"headlessMode": true, "retryAttempts": 3, "timeoutDuration": 30000, "screenshotInterval": 5000}',
  notification_config JSONB DEFAULT '{"pushEnabled": true, "errorAlerts": true, "successAlerts": true, "quotaWarnings": true}',
  ui_config JSONB DEFAULT '{"theme": "dark", "autoScroll": true, "compactMode": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Automation sessions table
CREATE TABLE public.automation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'IDLE',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  runtime_seconds INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Logs table for automation logging
CREATE TABLE public.automation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.automation_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Screenshots table
CREATE TABLE public.screenshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.automation_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_accounts_priority ON public.accounts(user_id, priority);
CREATE INDEX idx_automation_sessions_user_id ON public.automation_sessions(user_id);
CREATE INDEX idx_automation_sessions_status ON public.automation_sessions(status);
CREATE INDEX idx_automation_logs_session_id ON public.automation_logs(session_id);
CREATE INDEX idx_automation_logs_created_at ON public.automation_logs(created_at);
CREATE INDEX idx_screenshots_session_id ON public.screenshots(session_id);

-- Enable Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for automation_sessions
CREATE POLICY "Users can view own sessions" ON public.automation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.automation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.automation_sessions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for automation_logs
CREATE POLICY "Users can view own logs" ON public.automation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.automation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for screenshots
CREATE POLICY "Users can view own screenshots" ON public.screenshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own screenshots" ON public.screenshots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();