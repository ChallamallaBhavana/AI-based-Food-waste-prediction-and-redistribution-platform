-- ==========================================================
-- AI-BASED FOOD WASTE PREDICTION AND REDISTRIBUTION SYSTEM
-- MySQL Initial Sample Data Seed Script
-- ==========================================================

USE food_waste_db;

-- 1. USERS
-- Default password for all seed accounts is: password123 (hashed with werkzeug pbkdf2:sha256)
INSERT INTO users (user_id, name, email, phone, password, role, created_at) VALUES
(1, 'System Administrator', 'admin@example.com', '+91 98765 43210', 'scrypt:32768:8:1$i84xVzVj8bQ9tWvJ$a187ee05e19ff562fbf8a9aeb24e1358359489568df5e8c1bbad2b801daff7a8cb4002d287bb7b5b5420d2d3a33930b809d42fe7c5553e414c24492da3dbf87c', 'admin', NOW()),
(2, 'Chef Vikram Sharma', 'restaurant@example.com', '+91 98480 12345', 'scrypt:32768:8:1$i84xVzVj8bQ9tWvJ$a187ee05e19ff562fbf8a9aeb24e1358359489568df5e8c1bbad2b801daff7a8cb4002d287bb7b5b5420d2d3a33930b809d42fe7c5553e414c24492da3dbf87c', 'restaurant', NOW()),
(3, 'Chef Ananya Roy', 'paradise@example.com', '+91 98480 54321', 'scrypt:32768:8:1$i84xVzVj8bQ9tWvJ$a187ee05e19ff562fbf8a9aeb24e1358359489568df5e8c1bbad2b801daff7a8cb4002d287bb7b5b5420d2d3a33930b809d42fe7c5553e414c24492da3dbf87c', 'restaurant', NOW()),
(4, 'Dr. Radhika Nair', 'ngo@example.com', '+91 97000 11223', 'scrypt:32768:8:1$i84xVzVj8bQ9tWvJ$a187ee05e19ff562fbf8a9aeb24e1358359489568df5e8c1bbad2b801daff7a8cb4002d287bb7b5b5420d2d3a33930b809d42fe7c5553e414c24492da3dbf87c', 'ngo', NOW()),
(5, 'Karthik Verma', 'robinhood@example.com', '+91 97000 44556', 'scrypt:32768:8:1$i84xVzVj8bQ9tWvJ$a187ee05e19ff562fbf8a9aeb24e1358359489568df5e8c1bbad2b801daff7a8cb4002d287bb7b5b5420d2d3a33930b809d42fe7c5553e414c24492da3dbf87c', 'ngo', NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. RESTAURANTS
INSERT INTO restaurants (restaurant_id, user_id, restaurant_name, location, contact, latitude, longitude) VALUES
(1, 2, 'Royal Spice Grand', 'Road No. 12, Banjara Hills, Hyderabad', '+91 98480 12345', 17.415600, 78.435000),
(2, 3, 'Paradise Heritage Kitchen', 'MG Road, Secunderabad', '+91 98480 54321', 17.441100, 78.498300)
ON DUPLICATE KEY UPDATE restaurant_name=VALUES(restaurant_name);

-- 3. NGOS
INSERT INTO ngos (ngo_id, user_id, ngo_name, location, contact_phone, food_requirement, required_quantity, capacity, availability, latitude, longitude) VALUES
(1, 4, 'Annapurna Seva Trust', 'Near Apollo Hospital, Jubilee Hills, Hyderabad', '+91 97000 11223', 'All Cooked Meals', 60.00, 120.00, 'Available', 17.431900, 78.407300),
(2, 5, 'Robin Hood Army Youth Chapter', 'Madhapur Metro Station Hub, Hyderabad', '+91 97000 44556', 'All Cooked Meals', 80.00, 150.00, 'Available', 17.448300, 78.391500),
(3, NULL, 'Akshaya Patra Community Centre', 'Koti Women\'s College Road, Hyderabad', '+91 98123 99887', 'Vegetarian Only', 100.00, 250.00, 'Available', 17.387100, 78.491700),
(4, NULL, 'Sneha Shelter for Homeless', 'Ameerpet Cross Roads, Hyderabad', '+91 99554 11223', 'Cooked Meals & Bakery', 45.00, 90.00, 'Available', 17.437500, 78.448300)
ON DUPLICATE KEY UPDATE ngo_name=VALUES(ngo_name);

-- 4. FOOD_RECORDS
INSERT INTO food_records (food_id, restaurant_id, food_name, food_type, quantity_prepared, quantity_sold, surplus_quantity, preparation_time, expiry_time, weather, festival, temperature, storage_condition, created_at) VALUES
(1, 1, 'Royal Hyderabadi Dum Biryani (Chicken & Veg)', 'Cooked Meal', 150.00, 115.00, 35.00, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Sunny', 'Weekend Special', 65.00, 'Hot Holding', NOW()),
(2, 1, 'Paneer Butter Masala & Fresh Tandoori Naan', 'Cooked Meal', 80.00, 55.00, 25.00, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Sunny', 'None', 24.00, 'Room Temperature', NOW()),
(3, 2, 'Dal Makhani & Fragrant Jeera Rice', 'Cooked Meal', 90.00, 60.00, 30.00, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 5 HOUR), 'Cloudy', 'None', 68.00, 'Hot Holding', NOW()),
(4, 2, 'Artisan Garlic Rolls & Dinner Breads', 'Bakery', 50.00, 30.00, 20.00, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 18 HOUR), 'Sunny', 'None', 22.00, 'Room Temperature', NOW())
ON DUPLICATE KEY UPDATE food_name=VALUES(food_name);

-- 5. PREDICTIONS
INSERT INTO predictions (prediction_id, food_id, predicted_surplus, prediction_date, demand_level, waste_risk, confidence) VALUES
(1, 1, 32.50, NOW(), 'High', 'Moderate', 0.8900),
(2, 2, 24.00, NOW(), 'Medium', 'Moderate', 0.8600),
(3, 3, 28.00, NOW(), 'Medium', 'Low', 0.8800),
(4, 4, 18.00, NOW(), 'Medium', 'Low', 0.8400)
ON DUPLICATE KEY UPDATE predicted_surplus=VALUES(predicted_surplus);

-- 6. FOOD_SAFETY
INSERT INTO food_safety (safety_id, food_id, preparation_time, storage_condition, expiry_time, safety_status, validation_reason, validation_date) VALUES
(1, 1, DATE_SUB(NOW(), INTERVAL 2 HOUR), 'Hot Holding', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'SAFE FOR REDISTRIBUTION', 'Hot holding verified at 65°C (Above safe 60°C threshold). Prepared 2.0 hours ago.', NOW()),
(2, 2, DATE_SUB(NOW(), INTERVAL 2 HOUR), 'Room Temperature', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'SAFE FOR REDISTRIBUTION', 'Stored at room temperature for 2.0 hours. Within safe 2-hour ambient holding window.', NOW()),
(3, 3, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'Hot Holding', DATE_ADD(NOW(), INTERVAL 5 HOUR), 'SAFE FOR REDISTRIBUTION', 'Hot holding compliant at 68°C. Immediate consumption optimal.', NOW()),
(4, 4, DATE_SUB(NOW(), INTERVAL 3 HOUR), 'Room Temperature', DATE_ADD(NOW(), INTERVAL 18 HOUR), 'SAFE FOR REDISTRIBUTION', 'Bakery items held in dry ambient conditions for 3 hours. Well within 24h limit.', NOW())
ON DUPLICATE KEY UPDATE safety_status=VALUES(safety_status);

-- 7. DONATIONS
INSERT INTO donations (donation_id, food_id, ngo_id, donation_quantity, donation_date, status, notes) VALUES
(1, 1, 1, 30.00, NOW(), 'In Transit', 'Hot meals packed in insulated containers for immediate distribution'),
(2, 2, 2, 22.00, NOW(), 'Delivered', 'Direct dispatch to youth volunteers at community distribution center')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 8. DELIVERIES
INSERT INTO deliveries (delivery_id, donation_id, pickup_location, destination, pickup_lat, pickup_lng, dest_lat, dest_lng, route, distance, estimated_time, delivery_status, created_at, updated_at) VALUES
(1, 1, 'Road No. 12, Banjara Hills, Hyderabad', 'Near Apollo Hospital, Jubilee Hills, Hyderabad', 17.415600, 78.435000, 17.431900, 78.407300, 'Via Banjara Hills Rd 12 -> Jubilee Hills Checkpost', 4.20, '18 mins', 'In Transit', NOW(), NOW()),
(2, 2, 'Road No. 12, Banjara Hills, Hyderabad', 'Madhapur Metro Station Hub, Hyderabad', 17.415600, 78.435000, 17.448300, 78.391500, 'Via Hitec City Flyover -> Madhapur Main Road', 6.80, '24 mins', 'Delivered', NOW(), NOW())
ON DUPLICATE KEY UPDATE delivery_status=VALUES(delivery_status);
