
-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create table for Instagram Graph API credentials (OAuth tokens only)
CREATE TABLE public.instagram_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id TEXT NOT NULL UNIQUE,
  instagram_user_id TEXT,
  instagram_username TEXT,
  access_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  page_id TEXT,
  page_access_token_encrypted TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - only service role (edge functions) can access
ALTER TABLE public.instagram_credentials ENABLE ROW LEVEL SECURITY;

-- No public policies - only service_role can read/write (via edge functions)
-- This ensures credentials are never exposed to the client

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_instagram_credentials_updated_at
BEFORE UPDATE ON public.instagram_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
