-- Pashuverse Supabase PostgreSQL Schema Update Script

-- 1. Create users table if it does not exist
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Farmer',
    phone TEXT,
    location TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Alter existing users table to ensure phone column exists (if table was created previously without it)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Comments on table column mappings
COMMENT ON COLUMN users.phone IS 'Authenticated veterinarian/farmer contact number for WebRTC transmission requests';
