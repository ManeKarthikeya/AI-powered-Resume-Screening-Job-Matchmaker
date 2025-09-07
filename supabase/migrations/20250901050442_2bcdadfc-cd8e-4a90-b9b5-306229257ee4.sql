-- Add embedding columns to store OpenAI vector embeddings
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE public.job_descriptions 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create indexes for efficient similarity search
CREATE INDEX IF NOT EXISTS idx_resumes_embedding ON public.resumes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_embedding ON public.job_descriptions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Update existing records to have proper embedding_text format where needed
UPDATE public.resumes 
SET embedding_text = COALESCE(extracted_text, '')
WHERE embedding_text IS NULL OR embedding_text = '';

UPDATE public.job_descriptions 
SET embedding_text = COALESCE(description, '')
WHERE embedding_text IS NULL OR embedding_text = '';