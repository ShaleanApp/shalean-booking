-- Create notification triggers for automatic notification generation
-- This migration creates triggers that automatically insert notifications
-- when relevant changes occur in bookings, payments, and cleaner assignments

-- First, let's add a 'read' column to the notifications table if it doesn't exist
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- Create an index for the read column
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Create a function to generate notifications
CREATE OR REPLACE FUNCTION generate_notification(
    p_user_id UUID,
    p_type TEXT,
    p_channel TEXT DEFAULT 'email',
    p_payload JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        channel,
        type,
        status,
        payload,
        read
    ) VALUES (
        p_user_id,
        p_channel,
        p_type,
        'pending',
        p_payload,
        false
    ) RETURNING id INTO notification_id;
    
    -- Trigger push notification for critical events
    PERFORM pg_notify('push_notification', json_build_object(
        'user_id', p_user_id,
        'type', p_type,
        'notification_id', notification_id,
        'payload', p_payload
    )::text);
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for booking status changes
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_type TEXT;
    notification_payload JSONB;
BEGIN
    -- Only trigger on status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Determine notification type based on status change
        CASE NEW.status
            WHEN 'confirmed' THEN
                notification_type := 'booking_confirmed';
                notification_payload := jsonb_build_object(
                    'booking_id', NEW.id,
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'service_date', NEW.service_date,
                    'service_time', NEW.service_time
                );
            WHEN 'in_progress' THEN
                notification_type := 'booking_started';
                notification_payload := jsonb_build_object(
                    'booking_id', NEW.id,
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'service_date', NEW.service_date,
                    'service_time', NEW.service_time
                );
            WHEN 'completed' THEN
                notification_type := 'booking_completed';
                notification_payload := jsonb_build_object(
                    'booking_id', NEW.id,
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'service_date', NEW.service_date,
                    'service_time', NEW.service_time
                );
            WHEN 'cancelled' THEN
                notification_type := 'booking_cancelled';
                notification_payload := jsonb_build_object(
                    'booking_id', NEW.id,
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'service_date', NEW.service_date,
                    'service_time', NEW.service_time
                );
            ELSE
                notification_type := 'booking_status_updated';
                notification_payload := jsonb_build_object(
                    'booking_id', NEW.id,
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'service_date', NEW.service_date,
                    'service_time', NEW.service_time
                );
        END CASE;

        -- Generate notification for customer
        PERFORM generate_notification(
            NEW.customer_id,
            notification_type,
            'email',
            notification_payload
        );

        -- If cleaner is assigned, also notify them
        IF NEW.cleaner_id IS NOT NULL THEN
            PERFORM generate_notification(
                NEW.cleaner_id,
                'cleaner_' || notification_type,
                'email',
                notification_payload
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for cleaner assignments
CREATE OR REPLACE FUNCTION notify_cleaner_assignment()
RETURNS TRIGGER AS $$
DECLARE
    notification_payload JSONB;
BEGIN
    -- Only trigger when cleaner_id changes from NULL to a value (new assignment)
    IF OLD.cleaner_id IS NULL AND NEW.cleaner_id IS NOT NULL THEN
        notification_payload := jsonb_build_object(
            'booking_id', NEW.id,
            'cleaner_id', NEW.cleaner_id,
            'service_date', NEW.service_date,
            'service_time', NEW.service_time,
            'total_price', NEW.total_price
        );

        -- Notify customer about cleaner assignment
        PERFORM generate_notification(
            NEW.customer_id,
            'cleaner_assigned',
            'email',
            notification_payload
        );

        -- Notify cleaner about new assignment
        PERFORM generate_notification(
            NEW.cleaner_id,
            'new_booking_assigned',
            'email',
            notification_payload
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for payment status changes
CREATE OR REPLACE FUNCTION notify_payment_status_change()
RETURNS TRIGGER AS $$
DECLARE
    notification_type TEXT;
    notification_payload JSONB;
    customer_id UUID;
BEGIN
    -- Only trigger on status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Get customer_id from the booking
        SELECT b.customer_id INTO customer_id
        FROM bookings b
        WHERE b.id = NEW.booking_id;

        -- Determine notification type based on payment status
        CASE NEW.status
            WHEN 'completed' THEN
                notification_type := 'payment_successful';
                notification_payload := jsonb_build_object(
                    'payment_id', NEW.id,
                    'booking_id', NEW.booking_id,
                    'amount', NEW.amount,
                    'currency', NEW.currency,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                );
            WHEN 'failed' THEN
                notification_type := 'payment_failed';
                notification_payload := jsonb_build_object(
                    'payment_id', NEW.id,
                    'booking_id', NEW.booking_id,
                    'amount', NEW.amount,
                    'currency', NEW.currency,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                );
            WHEN 'refunded' THEN
                notification_type := 'payment_refunded';
                notification_payload := jsonb_build_object(
                    'payment_id', NEW.id,
                    'booking_id', NEW.booking_id,
                    'amount', NEW.amount,
                    'currency', NEW.currency,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                );
            ELSE
                notification_type := 'payment_status_updated';
                notification_payload := jsonb_build_object(
                    'payment_id', NEW.id,
                    'booking_id', NEW.booking_id,
                    'amount', NEW.amount,
                    'currency', NEW.currency,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                );
        END CASE;

        -- Generate notification for customer
        IF customer_id IS NOT NULL THEN
            PERFORM generate_notification(
                customer_id,
                notification_type,
                'email',
                notification_payload
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the triggers
CREATE TRIGGER trigger_notify_booking_status_change
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_booking_status_change();

CREATE TRIGGER trigger_notify_cleaner_assignment
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_cleaner_assignment();

CREATE TRIGGER trigger_notify_payment_status_change
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION notify_payment_status_change();

-- Create a function to manually trigger notifications for testing
CREATE OR REPLACE FUNCTION test_notification_triggers()
RETURNS TABLE(
    test_name TEXT,
    notification_id UUID,
    user_id UUID,
    type TEXT,
    status TEXT
) AS $$
DECLARE
    test_booking_id UUID;
    test_customer_id UUID;
    test_cleaner_id UUID;
    test_payment_id UUID;
    notification_record RECORD;
BEGIN
    -- Get a test booking and related IDs
    SELECT id, customer_id, cleaner_id INTO test_booking_id, test_customer_id, test_cleaner_id
    FROM bookings 
    LIMIT 1;
    
    IF test_booking_id IS NULL THEN
        RAISE NOTICE 'No bookings found for testing';
        RETURN;
    END IF;

    -- Get a test payment
    SELECT id INTO test_payment_id
    FROM payments 
    WHERE booking_id = test_booking_id
    LIMIT 1;

    -- Test 1: Booking status change
    RAISE NOTICE 'Testing booking status change notification...';
    UPDATE bookings 
    SET status = 'confirmed' 
    WHERE id = test_booking_id;
    
    -- Test 2: Cleaner assignment (if not already assigned)
    IF test_cleaner_id IS NULL THEN
        RAISE NOTICE 'Testing cleaner assignment notification...';
        UPDATE bookings 
        SET cleaner_id = test_customer_id  -- Using customer as cleaner for test
        WHERE id = test_booking_id;
    END IF;

    -- Test 3: Payment status change (if payment exists)
    IF test_payment_id IS NOT NULL THEN
        RAISE NOTICE 'Testing payment status change notification...';
        UPDATE payments 
        SET status = 'completed' 
        WHERE id = test_payment_id;
    END IF;

    -- Return the generated notifications
    FOR notification_record IN
        SELECT 
            'Generated Notification' as test_name,
            n.id as notification_id,
            n.user_id,
            n.type,
            n.status
        FROM notifications n
        WHERE n.created_at > NOW() - INTERVAL '1 minute'
        ORDER BY n.created_at DESC
    LOOP
        test_name := notification_record.test_name;
        notification_id := notification_record.notification_id;
        user_id := notification_record.user_id;
        type := notification_record.type;
        status := notification_record.status;
        RETURN NEXT;
    END LOOP;

END;
$$ LANGUAGE plpgsql;

