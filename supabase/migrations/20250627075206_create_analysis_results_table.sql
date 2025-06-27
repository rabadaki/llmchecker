-- Create the analysis_results table
CREATE TABLE analysis_results (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT NULL, -- Will be used when authentication is added
  results JSONB NOT NULL,
  original_search_term TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

-- Create index for faster lookups
CREATE INDEX idx_analysis_results_id ON analysis_results(id);
CREATE INDEX idx_analysis_results_expires_at ON analysis_results(expires_at);
CREATE INDEX idx_analysis_results_user_id ON analysis_results(user_id);

-- Enable Row Level Security (RLS) for future authentication
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to public results
CREATE POLICY "Public results are viewable by everyone" ON analysis_results
  FOR SELECT USING (is_public = true);

-- Policy to allow anyone to insert results (for now)
CREATE POLICY "Anyone can insert results" ON analysis_results
  FOR INSERT WITH CHECK (true);