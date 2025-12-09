-- Migration: Add notifications table
-- Run this migration to add user notifications support

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
  metadata jsonb, -- Additional data (job_id, company, etc.)
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

-- Service role can insert notifications (for system-generated notifications)
CREATE POLICY "Service role can insert notifications." ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- =====================================================
-- Function to create notification
-- =====================================================
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_description text DEFAULT NULL,
  p_action_url text DEFAULT NULL,
  p_action_text text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, description, action_url, action_text, metadata)
  VALUES (p_user_id, p_type, p_title, p_description, p_action_url, p_action_text, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Trigger to create notification on new job match
-- =====================================================
CREATE OR REPLACE FUNCTION notify_on_job_match()
RETURNS trigger AS $$
BEGIN
  -- Create notification when a new high-scoring job match is found
  IF NEW.match_score >= 85 THEN
    INSERT INTO notifications (user_id, type, title, description, action_url, action_text, metadata)
    VALUES (
      NEW.user_id,
      'job',
      'New high match job: ' || (NEW.job_data->>'title')::text,
      'This role at ' || (NEW.job_data->>'company')::text || ' matches ' || NEW.match_score || '% of your profile!',
      '/jobs/' || NEW.job_id,
      'View Job',
      jsonb_build_object('job_id', NEW.job_id, 'match_score', NEW.match_score, 'company', NEW.job_data->>'company')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to job_matches table (if it exists)
DROP TRIGGER IF EXISTS job_match_notification_trigger ON job_matches;
CREATE TRIGGER job_match_notification_trigger
  AFTER INSERT ON job_matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_job_match();

-- =====================================================
-- Trigger to create notification on application status change
-- =====================================================
CREATE OR REPLACE FUNCTION notify_on_application_update()
RETURNS trigger AS $$
BEGIN
  -- Only notify if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, type, title, description, action_url, action_text, metadata)
    VALUES (
      NEW.user_id,
      'application',
      CASE NEW.status
        WHEN 'screening' THEN 'Application moved to screening'
        WHEN 'interviewing' THEN 'Interview scheduled!'
        WHEN 'offer' THEN 'Congratulations! You received an offer'
        WHEN 'rejected' THEN 'Application status updated'
        ELSE 'Application status updated'
      END,
      'Your application status has been updated.',
      '/applications',
      'View Application',
      jsonb_build_object('application_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to job_applications table
DROP TRIGGER IF EXISTS application_update_notification_trigger ON job_applications;
CREATE TRIGGER application_update_notification_trigger
  AFTER UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_application_update();

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE notifications IS 'User notifications for job matches, applications, and system alerts';
COMMENT ON COLUMN notifications.type IS 'Type of notification: job, interview, application, system, alert';
COMMENT ON COLUMN notifications.unread IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.metadata IS 'Additional JSON data related to the notification';
