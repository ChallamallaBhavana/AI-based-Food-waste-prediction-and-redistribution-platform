import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_food_waste_dataset(num_samples=2500, output_path=None):
    if output_path is None:
        base_dir = os.path.dirname(__file__)
        output_path = os.path.join(base_dir, 'food_waste_dataset.csv')

    np.random.seed(42)
    random.seed(42)

    food_names = [
        ('Biryani (Chicken/Veg)', 'Cooked Meal', 120, 350),
        ('Paneer Butter Masala & Roti', 'Cooked Meal', 80, 250),
        ('South Indian Meals / Rice', 'Cooked Meal', 90, 200),
        ('Dal Makhani & Naan', 'Cooked Meal', 70, 180),
        ('Sandwiches & Bakery Rolls', 'Bakery', 40, 100),
        ('Samosas & Evening Snacks', 'Snacks', 60, 150),
        ('Fried Rice & Noodles', 'Cooked Meal', 75, 220),
        ('Fresh Fruit Salad / Custard', 'Dairy', 30, 80),
        ('Curd Rice & Buttermilk', 'Dairy', 50, 120),
        ('Pasta & Continental Platters', 'Cooked Meal', 45, 160)
    ]

    weathers = ['Sunny', 'Rainy', 'Cloudy', 'Cold', 'Humid']
    festivals = ['None', 'Diwali', 'Eid', 'Christmas', 'Weekend Special', 'New Year', 'Local Carnival']
    
    start_date = datetime(2025, 1, 1)
    data = []

    for i in range(num_samples):
        food_choice = random.choice(food_names)
        food_name, food_type, min_prep, max_prep = food_choice
        
        date = start_date + timedelta(days=random.randint(0, 365))
        day_of_week = date.weekday() # 0 = Monday, 6 = Sunday
        is_weekend = 1 if day_of_week in [5, 6] else 0

        weather = random.choice(weathers)
        festival = random.choices(festivals, weights=[0.60, 0.08, 0.08, 0.06, 0.10, 0.04, 0.04])[0]

        # Base preparation
        quantity_prepared = round(random.uniform(min_prep, max_prep), 1)
        if festival != 'None' or is_weekend:
            quantity_prepared = round(quantity_prepared * random.uniform(1.2, 1.5), 1)

        # Demand factor influenced by weather and festivals
        demand_multiplier = 0.85
        if is_weekend:
            demand_multiplier += 0.15
        if festival != 'None':
            demand_multiplier += 0.20
        if weather == 'Rainy':
            demand_multiplier -= 0.15
        elif weather == 'Cold':
            demand_multiplier += 0.05

        # Previous day demand
        prev_demand = round(quantity_prepared * random.uniform(0.70, 0.95), 1)

        # Actual sold quantity
        sold_ratio = np.clip(random.gauss(demand_multiplier, 0.10), 0.50, 0.98)
        quantity_sold = round(quantity_prepared * sold_ratio, 1)
        if quantity_sold > quantity_prepared:
            quantity_sold = quantity_prepared

        remaining_surplus = round(quantity_prepared - quantity_sold, 1)
        surplus_ratio = remaining_surplus / quantity_prepared

        # Determine demand level
        if sold_ratio > 0.85:
            demand_level = 'High'
        elif sold_ratio > 0.70:
            demand_level = 'Medium'
        else:
            demand_level = 'Low'

        # Waste risk
        if surplus_ratio > 0.25:
            waste_risk = 'High'
        elif surplus_ratio > 0.12:
            waste_risk = 'Moderate'
        else:
            waste_risk = 'Low'

        data.append({
            'food_name': food_name,
            'food_type': food_type,
            'quantity_prepared': quantity_prepared,
            'previous_demand': prev_demand,
            'day_of_week': day_of_week,
            'is_weekend': is_weekend,
            'weather': weather,
            'festival': festival,
            'quantity_sold': quantity_sold,
            'surplus_quantity': remaining_surplus,
            'demand_level': demand_level,
            'waste_risk': waste_risk
        })

    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} realistic records and saved to: {output_path}")
    return df

if __name__ == '__main__':
    generate_food_waste_dataset()
