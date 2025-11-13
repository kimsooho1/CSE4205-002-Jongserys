-- Add userId column
ALTER TABLE users ADD COLUMN user_id VARCHAR(50) NOT NULL;

-- Create unique constraint on userId
ALTER TABLE users ADD CONSTRAINT uk_user_user_id UNIQUE (user_id);

-- Drop email unique constraint and column
ALTER TABLE users DROP CONSTRAINT uk_user_email;
ALTER TABLE users DROP COLUMN email;
