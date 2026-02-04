-- Bricks Academy Tools - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: access_requests
-- Stores email access requests from the landing page
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: users
-- Stores approved users who can access the tools
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Row Level Security (RLS)
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert access requests (for the public form)
CREATE POLICY "Anyone can request access" ON access_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users can view access requests
CREATE POLICY "Authenticated users can view requests" ON access_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update access requests
CREATE POLICY "Authenticated users can update requests" ON access_requests
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can view users table
CREATE POLICY "Authenticated users can view users" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert users
CREATE POLICY "Authenticated users can insert users" ON users
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Insert a default admin user (you'll need to create this user in Supabase Auth first)
-- INSERT INTO users (email, is_admin) VALUES ('admin@bricksacademy.fr', true);
