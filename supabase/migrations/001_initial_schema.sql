-- FoundryAI Database Schema
-- Run this in: Supabase Dashboard → SQL Editor

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  reality_checks_used INTEGER DEFAULT 0,
  reality_checks_limit INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- IDEAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Other',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'validating', 'validated', 'launched', 'archived')),
  stage TEXT DEFAULT 'concept' CHECK (stage IN ('concept', 'validation', 'mvp', 'growth', 'scale')),
  reality_score INTEGER DEFAULT 0 CHECK (reality_score BETWEEN 0 AND 100),
  market_score INTEGER DEFAULT 0 CHECK (market_score BETWEEN 0 AND 100),
  uniqueness_score INTEGER DEFAULT 0 CHECK (uniqueness_score BETWEEN 0 AND 100),
  feasibility_score INTEGER DEFAULT 0 CHECK (feasibility_score BETWEEN 0 AND 100),
  launch_progress INTEGER DEFAULT 0 CHECK (launch_progress BETWEEN 0 AND 100),
  checklist_completed INTEGER DEFAULT 0,
  checklist_total INTEGER DEFAULT 25,
  version INTEGER DEFAULT 1,
  is_archived BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REALITY CHECKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.reality_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  market_score INTEGER CHECK (market_score BETWEEN 0 AND 100),
  uniqueness_score INTEGER CHECK (uniqueness_score BETWEEN 0 AND 100),
  feasibility_score INTEGER CHECK (feasibility_score BETWEEN 0 AND 100),
  market_size TEXT DEFAULT '',
  competition TEXT DEFAULT 'medium' CHECK (competition IN ('low', 'medium', 'high', 'very-high')),
  feasibility TEXT DEFAULT 'medium' CHECK (feasibility IN ('low', 'medium', 'high')),
  uniqueness TEXT DEFAULT 'medium' CHECK (uniqueness IN ('low', 'medium', 'high')),
  insights JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  opportunities JSONB DEFAULT '[]'::jsonb,
  model_used TEXT DEFAULT 'gpt-4o',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
  idea_title TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Ideas: full CRUD on own ideas only
CREATE POLICY "Users can view own ideas" ON public.ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create ideas" ON public.ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON public.ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideas" ON public.ideas FOR DELETE USING (auth.uid() = user_id);

-- Reality checks: own only
CREATE POLICY "Users can view own checks" ON public.reality_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create checks" ON public.reality_checks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Activities: own only
CREATE POLICY "Users can view own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ideas_updated_at BEFORE UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
