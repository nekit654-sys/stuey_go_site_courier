-- Add settings columns to couriers table
ALTER TABLE t_p25272970_courier_button_site.couriers 
ADD COLUMN IF NOT EXISTS graphics_quality VARCHAR(10) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weather_preference VARCHAR(10) DEFAULT 'clear';