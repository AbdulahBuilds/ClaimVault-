-- =====================================================================
-- ClaimVault — PostgreSQL Master Database Schema (Phase 11)
-- Target: PostgreSQL 14+ / Supabase / Neon / AWS RDS
-- =====================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- Table 1: users
-- Stores user accounts, profile details, and auth credentials
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
    is_pro BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ---------------------------------------------------------------------
-- Table 2: products
-- Stores purchased items, prices, invoice info, and warranties
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(120) NOT NULL,
    model VARCHAR(120) NOT NULL DEFAULT 'Standard Edition',
    category VARCHAR(60) NOT NULL DEFAULT 'Electronics',
    price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
    purchase_date DATE NOT NULL,
    store_name VARCHAR(200) NOT NULL,
    store_location VARCHAR(255),
    invoice_number VARCHAR(100),
    image_url TEXT,
    notes TEXT,
    
    -- Warranty Details
    warranty_duration_months INT NOT NULL DEFAULT 12,
    warranty_duration_label VARCHAR(80) NOT NULL DEFAULT '1 Year',
    warranty_start_date DATE NOT NULL,
    warranty_expiry_date DATE NOT NULL,
    warranty_type VARCHAR(50) NOT NULL DEFAULT 'Manufacturer',
    warranty_provider VARCHAR(150),
    
    -- Return Period Details
    has_return_period BOOLEAN NOT NULL DEFAULT TRUE,
    return_duration_days INT NOT NULL DEFAULT 7,
    return_deadline DATE NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_purchase_date ON products(purchase_date);
CREATE INDEX IF NOT EXISTS idx_products_warranty_expiry ON products(warranty_expiry_date);
CREATE INDEX IF NOT EXISTS idx_products_return_deadline ON products(return_deadline);
CREATE INDEX IF NOT EXISTS idx_products_name_brand ON products(name, brand);

-- ---------------------------------------------------------------------
-- Table 3: receipts
-- Stores receipt and invoice attachment metadata & storage URLs
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    file_size VARCHAR(50) NOT NULL DEFAULT '1.5 MB',
    mime_type VARCHAR(100) NOT NULL DEFAULT 'image/jpeg',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipts_product_id ON receipts(product_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);

-- ---------------------------------------------------------------------
-- Table 4: reminders
-- Stores scheduled deadline reminders & dismissal records
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reminder_type VARCHAR(40) NOT NULL, -- 'warranty_expiry' | 'return_deadline'
    target_date DATE NOT NULL,
    lead_days INT NOT NULL DEFAULT 7,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending' | 'completed' | 'dismissed'
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_product_id ON reminders(product_id);
CREATE INDEX IF NOT EXISTS idx_reminders_target_date ON reminders(target_date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

-- ---------------------------------------------------------------------
-- Table 5: user_settings
-- Stores user preference flags and reminder lead-time rules
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    timing_rules JSONB NOT NULL DEFAULT '{"before30Days": true, "before14Days": true, "before7Days": true, "before3Days": true, "before1Day": true, "onDeadline": true}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for auto updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER trg_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
