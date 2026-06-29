-- SQL Schema for appgene (Ophthalmology Clinic Management)
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Create clinic_settings table
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_name TEXT NOT NULL,
    clinic_address TEXT NOT NULL,
    owner_phone TEXT,
    social_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for clinic_settings
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Policies for clinic_settings
CREATE POLICY "Allow anyone to read clinic settings"
    ON public.clinic_settings FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to insert their own clinic settings"
    ON public.clinic_settings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their own clinic settings"
    ON public.clinic_settings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 2. Create appointment_links table
CREATE TABLE IF NOT EXISTS public.appointment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_used BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for appointment_links
ALTER TABLE public.appointment_links ENABLE ROW LEVEL SECURITY;

-- Policies for appointment_links (Public accessibility is needed for clients booking appointments)
CREATE POLICY "Allow anyone to read appointment links"
    ON public.appointment_links FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated users to create appointment links"
    ON public.appointment_links FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow anyone to update appointment links (for marking as used)"
    ON public.appointment_links FOR UPDATE
    USING (true)
    WITH CHECK (true);
