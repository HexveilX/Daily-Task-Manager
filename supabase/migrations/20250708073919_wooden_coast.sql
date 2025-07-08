/*
  # Create tasks table

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `title` (text, required)
      - `description` (text, optional)
      - `priority` (text, required)
      - `deadline` (text, optional)
      - `completed` (boolean, default false)
      - `category` (text, required)
      - `user_id` (uuid, references profiles)

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for user-specific CRUD operations
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  title text NOT NULL,
  description text,
  priority text NOT NULL,
  deadline text,
  completed boolean DEFAULT false,
  category text NOT NULL DEFAULT 'general',
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tasks for themselves"
  ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON tasks(created_at);
CREATE INDEX IF NOT EXISTS tasks_deadline_idx ON tasks(deadline);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON tasks(completed);