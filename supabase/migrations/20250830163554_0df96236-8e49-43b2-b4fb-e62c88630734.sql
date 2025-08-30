-- Add JSONB column for yoga profile data
ALTER TABLE public.profiles 
ADD COLUMN yoga_profile JSONB;

-- Add comment for the new column
COMMENT ON COLUMN public.profiles.yoga_profile IS 'User yoga questionnaire profile data stored as JSON';