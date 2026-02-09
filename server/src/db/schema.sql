-- Enable UUID extension if needed (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CORE AUTHENTICATION & SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_mode VARCHAR(50) DEFAULT 'period', -- period, conceive, pregnancy, perimenopause
  theme_preference VARCHAR(20) DEFAULT 'system',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CORE CYCLE DATA (The Backbone)
-- ============================================================================

-- Periods: The central event for all reproductive health modes
CREATE TABLE IF NOT EXISTS periods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_prediction BOOLEAN DEFAULT FALSE,
  confidence_score FLOAT, -- NULL for actual periods, 0.0-1.0 for predictions
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Logs: Shared symptoms, mood, energy
-- Designed to be flexible enough for all modes
CREATE TABLE IF NOT EXISTS daily_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptoms JSONB DEFAULT '[]', -- Array of strings e.g. ["cramps", "headache"]
  mood VARCHAR(50),
  energy VARCHAR(20),
  notes TEXT,
  severity VARCHAR(20), -- low, medium, high
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date) -- One log per day per user
);

-- ============================================================================
-- 3. MODE-SPECIFIC DATA ISOLATION
-- ============================================================================

-- Mode: CONCEIVE (Fertility Tracking)
CREATE TABLE IF NOT EXISTS conceive_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  basal_body_temperature DECIMAL(4, 2), -- Celsius or Fahrenheit (app logic handles unit)
  cervical_mucus_quality VARCHAR(50),   -- dry, sticky, creamy, egg_white
  ovulation_test_result BOOLEAN,        -- true = positive (LH surge)
  sexual_activity BOOLEAN,
  notes TEXT,
  UNIQUE(user_id, date)
);

-- Mode: PREGNANCY (Milestones & Vitals)
CREATE TABLE IF NOT EXISTS pregnancy_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  conception_date DATE,
  last_period_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- active, birth, loss
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mode: PERIMENOPAUSE (Symptom Transitions)
CREATE TABLE IF NOT EXISTS perimenopause_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hot_flash_count INTEGER DEFAULT 0,
  sleep_quality_score INTEGER CHECK (sleep_quality_score BETWEEN 1 AND 10),
  mood_variability_index FLOAT, -- Calculated score
  UNIQUE(user_id, date)
);

-- ============================================================================
-- 4. OPIK PREDICTION & OPTIMIZATION LOOP
-- ============================================================================

-- Stores AI predictions to compare against reality later
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,         -- When we made the prediction
  target_date DATE NOT NULL,             -- The date we predicted (e.g., predicted start of next period)
  input_data_snapshot JSONB,             -- Snapshot of history used (for debugging/replay)
  model_version VARCHAR(50),             -- "v1_heuristic", "v2_gemini_opik", etc.
  actual_date DATE,                      -- Filled when the user logs the actual event
  error_days INTEGER,                    -- Calculated: actual_date - target_date
  opik_trace_id VARCHAR(255),            -- Link to Opik trace for optimization
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_periods_user_start ON periods(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_logs_user_date ON daily_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
