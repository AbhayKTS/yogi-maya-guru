-- Add astrological profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN birth_date DATE,
ADD COLUMN birth_time TIME,
ADD COLUMN birth_place TEXT,
ADD COLUMN birth_latitude DECIMAL(10, 8),
ADD COLUMN birth_longitude DECIMAL(11, 8);

-- Add comment for the new columns
COMMENT ON COLUMN public.profiles.birth_date IS 'User birth date for astrological calculations';
COMMENT ON COLUMN public.profiles.birth_time IS 'User birth time for astrological calculations';
COMMENT ON COLUMN public.profiles.birth_place IS 'User birth place for astrological calculations';
COMMENT ON COLUMN public.profiles.birth_latitude IS 'Latitude of birth place';
COMMENT ON COLUMN public.profiles.birth_longitude IS 'Longitude of birth place';