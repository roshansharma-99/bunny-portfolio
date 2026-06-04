-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the table for portfolio context chunks
CREATE TABLE IF NOT EXISTS portfolio_context_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(768)
);

-- Create a function to query similarity using cosine distance (<=> operator in pgvector)
CREATE OR REPLACE FUNCTION match_portfolio_chunks (
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    portfolio_context_chunks.id,
    portfolio_context_chunks.content,
    1 - (portfolio_context_chunks.embedding <=> query_embedding) AS similarity
  FROM portfolio_context_chunks
  WHERE 1 - (portfolio_context_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY portfolio_context_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
