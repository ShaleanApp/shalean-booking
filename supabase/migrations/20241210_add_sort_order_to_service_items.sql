-- Add sort_order column to service_items table
ALTER TABLE public.service_items 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing records to have sort_order
UPDATE public.service_items 
SET sort_order = 0 
WHERE sort_order IS NULL;

-- Make sort_order NOT NULL
ALTER TABLE public.service_items 
ALTER COLUMN sort_order SET NOT NULL;
