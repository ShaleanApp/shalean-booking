-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Service categories policies (public read, admin write)
CREATE POLICY "Anyone can view active service categories" ON service_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage service categories" ON service_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Service items policies (public read, admin write)
CREATE POLICY "Anyone can view active service items" ON service_items
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage service items" ON service_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Service extras policies (public read, admin write)
CREATE POLICY "Anyone can view active service extras" ON service_extras
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage service extras" ON service_extras
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Addresses policies (users can manage their own addresses)
CREATE POLICY "Users can view their own addresses" ON addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON addresses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" ON addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Customers can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Cleaners can view their assigned bookings" ON bookings
    FOR SELECT USING (
        auth.uid() = cleaner_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Customers can create their own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own pending bookings" ON bookings
    FOR UPDATE USING (
        auth.uid() = customer_id AND status = 'pending'
    );

CREATE POLICY "Cleaners can update assigned bookings" ON bookings
    FOR UPDATE USING (
        auth.uid() = cleaner_id AND status IN ('confirmed', 'in_progress', 'completed')
    );

CREATE POLICY "Admins can manage all bookings" ON bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Booking services policies
CREATE POLICY "Users can view booking services for their bookings" ON booking_services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_services.booking_id 
            AND (customer_id = auth.uid() OR cleaner_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Customers can create booking services for their bookings" ON booking_services
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_services.booking_id 
            AND customer_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage booking services" ON booking_services
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Booking extras policies
CREATE POLICY "Users can view booking extras for their bookings" ON booking_extras
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_extras.booking_id 
            AND (customer_id = auth.uid() OR cleaner_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Customers can create booking extras for their bookings" ON booking_extras
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_extras.booking_id 
            AND customer_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage booking extras" ON booking_extras
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Payments policies
CREATE POLICY "Users can view payments for their bookings" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = payments.booking_id 
            AND (customer_id = auth.uid() OR cleaner_id = auth.uid())
        ) OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can create payments" ON payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON payments
    FOR UPDATE USING (true);

CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
