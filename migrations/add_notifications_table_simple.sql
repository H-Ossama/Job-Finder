-- Migration: Add notifications table (Simple version)
-- Run this migration to add user notifications support
-- This version skips triggers that depend on other tables

-- =====================================================
-- Notifications Table
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('job', 'interview', 'application', 'system', 'alert')),
  title text NOT NULL,
  description text,
  action_url text,
  action_text text,
  secondary_action text,
  unread boolean DEFAULT true,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON notifications(unread) WHERE unread = true;
CREATE INDEX IF NOT EXISTS notifications_type_idx ON notifications(type);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications." ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications." ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications." ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Users can insert their own notifications
CREATE POLICY "Users can insert own notifications." ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE notifications IS 'User notifications for job matches, applications, and system alerts';
COMMENT ON COLUMN notifications.type IS 'Type of notification: job, interview, application, system, alert';
COMMENT ON COLUMN notifications.unread IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.metadata IS 'Additional JSON data related to the notification';
