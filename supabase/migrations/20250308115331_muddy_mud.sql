/*
  # Create dashboards table

  1. New Tables
    - `dashboards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `dataset_info` (jsonb)
      - `insights` (jsonb)
      - `charts` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `dashboards` table
    - Add policies for authenticated users to:
      - Read their own dashboards
      - Create new dashboards
      - Update their own dashboards
      - Delete their own dashboards
*/

CREATE TABLE IF NOT EXISTS dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  dataset_info jsonb NOT NULL,
  insights jsonb NOT NULL,
  charts jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own dashboards
CREATE POLICY "Users can read own dashboards"
  ON dashboards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to create dashboards
CREATE POLICY "Users can create dashboards"
  ON dashboards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own dashboards
CREATE POLICY "Users can update own dashboards"
  ON dashboards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own dashboards
CREATE POLICY "Users can delete own dashboards"
  ON dashboards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);