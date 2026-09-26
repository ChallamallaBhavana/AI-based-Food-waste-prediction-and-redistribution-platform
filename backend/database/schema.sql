-- ==========================================================
-- AI-BASED FOOD WASTE PREDICTION AND REDISTRIBUTION SYSTEM
-- MySQL Database Schema Definition
-- ==========================================================

CREATE DATABASE IF NOT EXISTS food_waste_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_waste_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('restaurant', 'ngo', 'admin') NOT NULL DEFAULT 'restaurant',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    restaurant_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(30),
    latitude DECIMAL(10, 7) DEFAULT 17.385044,
    longitude DECIMAL(10, 7) DEFAULT 78.486671,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. NGOS TABLE
CREATE TABLE IF NOT EXISTS ngos (
    ngo_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    ngo_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    food_requirement VARCHAR(100) NOT NULL DEFAULT 'All Cooked Meals',
    required_quantity DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
    capacity DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    availability ENUM('Available', 'Busy', 'Inactive') NOT NULL DEFAULT 'Available',
    latitude DECIMAL(10, 7) DEFAULT 17.395044,
    longitude DECIMAL(10, 7) DEFAULT 78.496671,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. FOOD_RECORDS TABLE
CREATE TABLE IF NOT EXISTS food_records (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    food_name VARCHAR(150) NOT NULL,
    food_type VARCHAR(50) DEFAULT 'Cooked Meal',
    quantity_prepared DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    quantity_sold DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    surplus_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    preparation_time DATETIME NULL,
    expiry_time DATETIME NULL,
    weather VARCHAR(50) DEFAULT 'Sunny',
    festival VARCHAR(100) DEFAULT 'None',
    temperature DECIMAL(5, 2) DEFAULT 25.00,
    storage_condition VARCHAR(50) DEFAULT 'Room Temperature',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS predictions (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    food_id INT NOT NULL,
    predicted_surplus DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    prediction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    demand_level ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
    waste_risk ENUM('High', 'Moderate', 'Low') NOT NULL DEFAULT 'Low',
    confidence DECIMAL(5, 4) DEFAULT 0.8500,
    FOREIGN KEY (food_id) REFERENCES food_records(food_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. FOOD_SAFETY TABLE
CREATE TABLE IF NOT EXISTS food_safety (
    safety_id INT AUTO_INCREMENT PRIMARY KEY,
    food_id INT NOT NULL,
    preparation_time DATETIME NULL,
    storage_condition VARCHAR(100) DEFAULT 'Room Temperature',
    expiry_time DATETIME NULL,
    safety_status ENUM('SAFE FOR REDISTRIBUTION', 'NOT SAFE FOR REDISTRIBUTION', 'NEEDS REVIEW') NOT NULL,
    validation_reason TEXT,
    validation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_id) REFERENCES food_records(food_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS donations (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    food_id INT NOT NULL,
    ngo_id INT NOT NULL,
    donation_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    donation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
    notes VARCHAR(255) NULL,
    FOREIGN KEY (food_id) REFERENCES food_records(food_id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. DELIVERIES TABLE
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL UNIQUE,
    pickup_location VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    pickup_lat DECIMAL(10, 7) DEFAULT 17.385044,
    pickup_lng DECIMAL(10, 7) DEFAULT 78.486671,
    dest_lat DECIMAL(10, 7) DEFAULT 17.400000,
    dest_lng DECIMAL(10, 7) DEFAULT 78.490000,
    route TEXT NULL,
    distance DECIMAL(8, 2) NOT NULL DEFAULT 5.00,
    estimated_time VARCHAR(50) NOT NULL DEFAULT '25 mins',
    delivery_status ENUM('Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered') NOT NULL DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES donations(donation_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS analytics (
    analytics_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_surplus DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_redistributed DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_waste DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    donation_count INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;
