-- Create enum for Ayurvedic doshas
CREATE TYPE public.dosha_type AS ENUM ('vata', 'pitta', 'kapha');

-- Create enum for warrior ranks
CREATE TYPE public.rank_type AS ENUM ('padatik', 'ashvarohi', 'gaja', 'ardharathi', 'rathi', 'ati_rathi', 'maharathi', 'maha_maharathi');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  dominant_dosha dosha_type,
  secondary_dosha dosha_type,
  sadhana_points INTEGER NOT NULL DEFAULT 0,
  current_rank rank_type NOT NULL DEFAULT 'padatik',
  login_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  birth_date DATE,
  birth_time TIME,
  birth_place TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shloks table for daily wisdom content
CREATE TABLE public.shloks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL, -- e.g., "Bhagavad Gita 2.47"
  sanskrit_text TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  translation TEXT NOT NULL,
  audio_url TEXT,
  chapter_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create favorite_shloks table for user saved shloks
CREATE TABLE public.favorite_shloks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shlok_id UUID NOT NULL REFERENCES public.shloks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shlok_id)
);

-- Create yoga_sessions table for tracking practice
CREATE TABLE public.yoga_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- e.g., "morning_energy", "evening_calm"
  duration_minutes INTEGER NOT NULL,
  accuracy_score DECIMAL(5,2), -- percentage from pose detection
  sadhana_points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dosha_assessment_responses table
CREATE TABLE public.dosha_assessment_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  answer_option TEXT NOT NULL, -- 'a', 'b', or 'c'
  dosha_mapping dosha_type NOT NULL, -- which dosha this answer maps to
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_shloks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dosha_assessment_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own favorite shloks" 
ON public.favorite_shloks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their favorite shloks" 
ON public.favorite_shloks 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own yoga sessions" 
ON public.yoga_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own yoga sessions" 
ON public.yoga_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own assessment responses" 
ON public.dosha_assessment_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessment responses" 
ON public.dosha_assessment_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Shloks are publicly readable
CREATE POLICY "Shloks are publicly readable" 
ON public.shloks 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample shloks for testing
INSERT INTO public.shloks (source, sanskrit_text, transliteration, translation, chapter_context) VALUES
  ('Bhagavad Gita 2.47', 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥', 'karmaṇy evādhikāras te mā phaleṣu kadācana mā karma-phala-hetur bhūr mā te saṅgo ''stv akarmaṇi', 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results, nor be attached to not doing your duty.', 'This verse from the Sankhya Yoga chapter teaches the principle of Nishkama Karma - performing action without attachment to results.'),
  ('Yoga Sutras 1.2', 'योगश्चित्तवृत्तिनिरोधः', 'yogaś-citta-vṛtti-nirodhaḥ', 'Yoga is the restraint of the fluctuations of the mind.', 'The fundamental definition of yoga according to Patanjali, emphasizing mental discipline and inner stillness.'),
  ('Isha Upanishad 1', 'ईशावास्यमिदं सर्वं यत्किञ्च जगत्यां जगत्। तेन त्यक्तेन भुञ्जीथा मा गृधः कस्य स्विद्धनम्॥', 'īśāvāsyam idaṃ sarvaṃ yat kiñca jagatyāṃ jagat tena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam', 'The entire universe is pervaded by the Divine. Enjoy life through renunciation. Do not covet anyone''s wealth.', 'The opening verse of the Isha Upanishad, teaching the principle of seeing divinity in all creation and living with contentment.');