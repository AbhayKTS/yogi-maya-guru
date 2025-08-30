-- Add missing astrological profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN birth_latitude DECIMAL(10, 8),
ADD COLUMN birth_longitude DECIMAL(11, 8);

-- Add comment for the new columns
COMMENT ON COLUMN public.profiles.birth_latitude IS 'Latitude of birth place';
COMMENT ON COLUMN public.profiles.birth_longitude IS 'Longitude of birth place';