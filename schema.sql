CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  job_title VARCHAR(100),
  company VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  repo_url TEXT NOT NULL,
  language VARCHAR(50),
  framework VARCHAR(50),
  database_tech VARCHAR(50),
  github_token TEXT,
  is_private BOOLEAN DEFAULT false,
  security_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scan_results (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  rule VARCHAR(100),
  severity VARCHAR(20),
  message TEXT,
  file_path TEXT,
  line_number INTEGER,
  status VARCHAR(20) DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scan_history (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  scan_type VARCHAR(20),
  status VARCHAR(20),
  total_issues INTEGER DEFAULT 0,
  critical INTEGER DEFAULT 0,
  high INTEGER DEFAULT 0,
  medium INTEGER DEFAULT 0,
  low INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
