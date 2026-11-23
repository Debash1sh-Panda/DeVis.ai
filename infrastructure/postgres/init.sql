-- PostgreSQL initialization script for DeVis.ai
-- This runs when the container is first started

-- Enable pgvector extension (install later for semantic memory)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Done
