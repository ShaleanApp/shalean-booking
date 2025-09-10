-- Insert service categories
INSERT INTO service_categories (id, name, description, icon, sort_order) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Residential Cleaning', 'Regular home cleaning services', 'home', 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'Deep Cleaning', 'Thorough cleaning for special occasions', 'sparkles', 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'Move-in/Move-out', 'Cleaning for property transitions', 'truck', 3),
    ('550e8400-e29b-41d4-a716-446655440004', 'Commercial Cleaning', 'Office and business cleaning', 'building', 4);

-- Insert service items
INSERT INTO service_items (id, category_id, name, description, base_price, duration_minutes, sort_order) VALUES
    -- Residential Cleaning
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Standard Home Cleaning', 'Regular cleaning of living areas, kitchen, and bathrooms', 120.00, 120, 1),
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Studio Apartment', 'Cleaning for studio apartments (up to 500 sq ft)', 80.00, 90, 2),
    ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '1 Bedroom', 'Cleaning for 1 bedroom apartments/homes', 100.00, 105, 3),
    ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '2 Bedroom', 'Cleaning for 2 bedroom apartments/homes', 140.00, 135, 4),
    ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '3 Bedroom', 'Cleaning for 3 bedroom homes', 180.00, 165, 5),
    ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '4+ Bedroom', 'Cleaning for 4+ bedroom homes', 220.00, 195, 6),
    
    -- Deep Cleaning
    ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Deep Clean Studio', 'Thorough deep cleaning for studio apartments', 150.00, 180, 1),
    ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Deep Clean 1 Bedroom', 'Thorough deep cleaning for 1 bedroom', 180.00, 210, 2),
    ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'Deep Clean 2 Bedroom', 'Thorough deep cleaning for 2 bedroom', 220.00, 240, 3),
    ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Deep Clean 3 Bedroom', 'Thorough deep cleaning for 3 bedroom', 280.00, 300, 4),
    ('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'Deep Clean 4+ Bedroom', 'Thorough deep cleaning for 4+ bedroom', 350.00, 360, 5),
    
    -- Move-in/Move-out
    ('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'Move-out Cleaning', 'Complete cleaning for move-out', 200.00, 240, 1),
    ('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Move-in Cleaning', 'Complete cleaning for move-in', 180.00, 210, 2),
    ('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'Post-Construction Clean', 'Cleaning after construction/renovation', 300.00, 360, 3),
    
    -- Commercial Cleaning
    ('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 'Small Office (up to 1000 sq ft)', 'Regular office cleaning for small spaces', 150.00, 120, 1),
    ('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', 'Medium Office (1000-3000 sq ft)', 'Regular office cleaning for medium spaces', 250.00, 180, 2),
    ('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440004', 'Large Office (3000+ sq ft)', 'Regular office cleaning for large spaces', 400.00, 240, 3);

-- Insert service extras
INSERT INTO service_extras (id, name, description, price, sort_order) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', 'Inside Refrigerator', 'Clean inside of refrigerator', 25.00, 1),
    ('750e8400-e29b-41d4-a716-446655440002', 'Inside Oven', 'Clean inside of oven', 30.00, 2),
    ('750e8400-e29b-41d4-a716-446655440003', 'Inside Microwave', 'Clean inside of microwave', 15.00, 3),
    ('750e8400-e29b-41d4-a716-446655440004', 'Window Cleaning (Interior)', 'Clean interior windows', 5.00, 4),
    ('750e8400-e29b-41d4-a716-446655440005', 'Window Cleaning (Exterior)', 'Clean exterior windows (ground floor only)', 8.00, 5),
    ('750e8400-e29b-41d4-a716-446655440006', 'Baseboards', 'Clean baseboards throughout home', 20.00, 6),
    ('750e8400-e29b-41d4-a716-446655440007', 'Light Fixtures', 'Clean light fixtures and ceiling fans', 15.00, 7),
    ('750e8400-e29b-41d4-a716-446655440008', 'Cabinet Interiors', 'Clean inside of kitchen cabinets', 30.00, 8),
    ('750e8400-e29b-41d4-a716-446655440009', 'Garage Cleaning', 'Clean garage space', 50.00, 9),
    ('750e8400-e29b-41d4-a716-446655440010', 'Patio/Balcony', 'Clean outdoor patio or balcony', 25.00, 10),
    ('750e8400-e29b-41d4-a716-446655440011', 'Laundry (Wash & Fold)', 'Wash and fold laundry', 0.50, 11),
    ('750e8400-e29b-41d4-a716-446655440012', 'Pet Hair Removal', 'Extra attention to pet hair removal', 20.00, 12),
    ('750e8400-e29b-41d4-a716-446655440013', 'Eco-Friendly Products', 'Use eco-friendly cleaning products', 10.00, 13),
    ('750e8400-e29b-41d4-a716-446655440014', 'Same Day Service', 'Schedule cleaning for same day', 25.00, 14),
    ('750e8400-e29b-41d4-a716-446655440015', 'Weekend Service', 'Schedule cleaning for weekend', 15.00, 15);
