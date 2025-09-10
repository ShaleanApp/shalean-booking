-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get user profile with role
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    role user_role,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.email, p.full_name, p.phone, p.role, p.avatar_url, p.created_at, p.updated_at
    FROM profiles p
    WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is cleaner
CREATE OR REPLACE FUNCTION public.is_cleaner(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id AND role = 'cleaner'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate booking total
CREATE OR REPLACE FUNCTION public.calculate_booking_total(booking_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total DECIMAL(10,2) := 0;
    service_total DECIMAL(10,2) := 0;
    extra_total DECIMAL(10,2) := 0;
BEGIN
    -- Calculate services total
    SELECT COALESCE(SUM(total_price), 0) INTO service_total
    FROM booking_services
    WHERE booking_id = calculate_booking_total.booking_id;
    
    -- Calculate extras total
    SELECT COALESCE(SUM(total_price), 0) INTO extra_total
    FROM booking_extras
    WHERE booking_id = calculate_booking_total.booking_id;
    
    total := service_total + extra_total;
    RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update booking total when services/extras change
CREATE OR REPLACE FUNCTION public.update_booking_total()
RETURNS TRIGGER AS $$
DECLARE
    booking_uuid UUID;
    new_total DECIMAL(10,2);
BEGIN
    -- Get booking ID from the changed record
    IF TG_TABLE_NAME = 'booking_services' THEN
        booking_uuid := NEW.booking_id;
    ELSIF TG_TABLE_NAME = 'booking_extras' THEN
        booking_uuid := NEW.booking_id;
    END IF;
    
    -- Calculate new total
    new_total := public.calculate_booking_total(booking_uuid);
    
    -- Update booking total
    UPDATE bookings 
    SET total_price = new_total, updated_at = NOW()
    WHERE id = booking_uuid;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update booking total when services/extras change
CREATE TRIGGER update_booking_total_on_service_change
    AFTER INSERT OR UPDATE OR DELETE ON booking_services
    FOR EACH ROW EXECUTE FUNCTION public.update_booking_total();

CREATE TRIGGER update_booking_total_on_extra_change
    AFTER INSERT OR UPDATE OR DELETE ON booking_extras
    FOR EACH ROW EXECUTE FUNCTION public.update_booking_total();
