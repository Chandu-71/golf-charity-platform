-- 0. Wipe existing tables to start fresh (Safe for a new project)
DROP TABLE IF EXISTS public.scores CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.charities CASCADE;
DROP TABLE IF EXISTS public.draws CASCADE;
DROP FUNCTION IF EXISTS keep_latest_five_scores() CASCADE;

-- 1. Create Charities Table
CREATE TABLE public.charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT
);

-- 2. Create Profiles Table 
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'user',
    subscription_status TEXT DEFAULT 'inactive',
    plan TEXT,
    charity_id UUID REFERENCES public.charities(id),
    charity_percentage INTEGER DEFAULT 10
);

-- 3. Create Scores Table 
CREATE TABLE public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 1 AND score <= 45),
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Draws Table
CREATE TABLE public.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_year DATE NOT NULL,
    winning_numbers INTEGER[] NOT NULL,
    status TEXT DEFAULT 'pending',
    total_prize_pool NUMERIC DEFAULT 0
);

-- 5. The Rolling 5-Score Trigger (PRD Requirement)
CREATE OR REPLACE FUNCTION keep_latest_five_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM public.scores
      WHERE user_id = NEW.user_id
      ORDER BY date DESC
      LIMIT 5
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_five_scores_limit
AFTER INSERT ON public.scores
FOR EACH ROW
EXECUTE FUNCTION keep_latest_five_scores();

-- 6. Enable Security (RLS)
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;

-- 7. Security Policies
CREATE POLICY "Charities viewable by everyone" ON public.charities FOR SELECT USING (true);
CREATE POLICY "Draws viewable by everyone" ON public.draws FOR SELECT USING (true);
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users view own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);