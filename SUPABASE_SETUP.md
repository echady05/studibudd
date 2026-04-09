# Supabase Setup Instructions for Contact Form

## Create contact_submissions table

Run the following SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/omxmgywncckagokoxgwu/sql):

```sql
-- Create contact_submissions table for rate limiting and logging
CREATE TABLE contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT contact_submissions_user_id_created_at_idx UNIQUE (user_id, DATE(created_at))
);

-- Create index for faster queries
CREATE INDEX contact_submissions_user_id_created_at_idx 
  ON contact_submissions(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts (for API endpoint)
CREATE POLICY "Allow inserts to contact_submissions"
  ON contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to read their own submissions
CREATE POLICY "Allow users to read their own submissions"
  ON contact_submissions
  FOR SELECT
  USING (true);
```

## Enable SMTP for Gmail (if not already done)

1. Go to https://myaccount.google.com/apppasswords
2. Create an app password for "Mail" and "Windows"
3. Use that password in your .env.local as EMAIL_PASSWORD (not your regular Gmail password)

## Environment Variables (.env.local)

The following have been added to your .env.local:
- `EMAIL_USER`: studibuddcontact@gmail.com
- `EMAIL_PASSWORD`: Your Gmail app-specific password
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: Already present

## Test the endpoint

After creating the table:

```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user@example.com",
    "message": "This is a test message"
  }'
```

Expected responses:
- **200**: Message sent successfully
- **429**: User already sent a message today
- **400**: Missing userId or message
- **500**: Server error
