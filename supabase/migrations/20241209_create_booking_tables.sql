-- Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_items table
CREATE TABLE IF NOT EXISTS public.service_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'item',
    is_quantity_based BOOLEAN DEFAULT true,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_extras table
CREATE TABLE IF NOT EXISTS public.service_extras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'home',
    name VARCHAR(100) NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Nigeria',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    service_date DATE NOT NULL,
    service_time TIME NOT NULL,
    address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    new_address JSONB,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_services table
CREATE TABLE IF NOT EXISTS public.booking_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_item_id UUID REFERENCES public.service_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_extras table
CREATE TABLE IF NOT EXISTS public.booking_extras (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    service_extra_id UUID REFERENCES public.service_extras(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    status VARCHAR(20) DEFAULT 'pending',
    paystack_transaction_id VARCHAR(100),
    paystack_reference VARCHAR(100),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample service categories
INSERT INTO public.service_categories (name, description, icon, sort_order) VALUES
('House Cleaning', 'Complete house cleaning services', 'home', 1),
('Office Cleaning', 'Professional office cleaning', 'building', 2),
('Deep Cleaning', 'Thorough deep cleaning services', 'sparkles', 3),
('Move-in/Move-out', 'Cleaning for moving transitions', 'truck', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert sample service items
INSERT INTO public.service_items (category_id, name, description, base_price, unit, is_quantity_based, min_quantity, max_quantity) VALUES
((SELECT id FROM public.service_categories WHERE name = 'House Cleaning'), 'Standard Clean', 'Regular house cleaning service', 15000.00, 'session', false, 1, 1),
((SELECT id FROM public.service_categories WHERE name = 'House Cleaning'), 'Bedrooms', 'Bedroom cleaning', 3000.00, 'room', true, 1, 5),
((SELECT id FROM public.service_categories WHERE name = 'House Cleaning'), 'Bathrooms', 'Bathroom cleaning', 2500.00, 'room', true, 1, 4),
((SELECT id FROM public.service_categories WHERE name = 'House Cleaning'), 'Living Areas', 'Living room and common areas', 2000.00, 'room', true, 1, 3),
((SELECT id FROM public.service_categories WHERE name = 'Office Cleaning'), 'Office Space', 'Office cleaning service', 20000.00, 'session', false, 1, 1),
((SELECT id FROM public.service_categories WHERE name = 'Office Cleaning'), 'Workstations', 'Individual workstation cleaning', 1500.00, 'desk', true, 1, 20),
((SELECT id FROM public.service_categories WHERE name = 'Deep Cleaning'), 'Deep Clean', 'Comprehensive deep cleaning', 25000.00, 'session', false, 1, 1),
((SELECT id FROM public.service_categories WHERE name = 'Move-in/Move-out'), 'Move-in Clean', 'Pre-move-in cleaning', 20000.00, 'session', false, 1, 1),
((SELECT id FROM public.service_categories WHERE name = 'Move-in/Move-out'), 'Move-out Clean', 'Post-move-out cleaning', 18000.00, 'session', false, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- Insert sample service extras
INSERT INTO public.service_extras (name, description, price) VALUES
('Inside Fridge', 'Clean inside of refrigerator', 2000.00),
('Inside Oven', 'Clean inside of oven', 1500.00),
('Window Cleaning', 'Clean all windows', 3000.00),
('Balcony Cleaning', 'Clean balcony/patio area', 2500.00),
('Garage Cleaning', 'Clean garage space', 4000.00),
('Laundry Service', 'Wash and fold laundry', 5000.00)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_items_category_id ON public.service_items(category_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id ON public.booking_services(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_extras_booking_id ON public.booking_extras(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);

-- Enable Row Level Security (RLS)
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access to service data
CREATE POLICY "Allow public read access to service categories" ON public.service_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to service items" ON public.service_items
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to service extras" ON public.service_extras
    FOR SELECT USING (true);

-- Create RLS policies for user-specific data
CREATE POLICY "Users can manage their own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookings" ON public.bookings
    FOR ALL USING (auth.uid() = user_id OR guest_email IS NOT NULL);

CREATE POLICY "Users can view their booking services" ON public.booking_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id 
            AND (auth.uid() = user_id OR guest_email IS NOT NULL)
        )
    );

CREATE POLICY "Users can view their booking extras" ON public.booking_extras
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id 
            AND (auth.uid() = user_id OR guest_email IS NOT NULL)
        )
    );

CREATE POLICY "Users can view their payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = booking_id 
            AND (auth.uid() = user_id OR guest_email IS NOT NULL)
        )
    );
