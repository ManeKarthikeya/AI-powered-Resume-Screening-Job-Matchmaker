-- Add additional profile fields
ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN github_url TEXT;
ALTER TABLE public.profiles ADD COLUMN leetcode_url TEXT;
ALTER TABLE public.profiles ADD COLUMN skills TEXT[];
ALTER TABLE public.profiles ADD COLUMN bio TEXT;
ALTER TABLE public.profiles ADD COLUMN resume_count INTEGER DEFAULT 0;