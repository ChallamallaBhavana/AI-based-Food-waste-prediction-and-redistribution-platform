import datetime
import sys
import os

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db import SessionLocal, init_db
from models.user import User
from models.restaurant import Restaurant
from models.ngo import NGO
from models.food_record import FoodRecord
from models.prediction import Prediction
from models.food_safety import FoodSafety
from models.donation import Donation
from models.delivery import Delivery

def seed_five_restaurants():
    print("Connecting to database...")
    init_db()
    db = SessionLocal()

    try:
        now = datetime.datetime.utcnow()

        # Define the 5 restaurants with their user accounts
        restaurants_spec = [
            {
                "email": "restaurant@example.com",
                "name": "Chef Vikram Sharma",
                "phone": "+91 98480 12345",
                "restaurant_name": "Royal Spice Grand",
                "location": "Road No. 12, Banjara Hills, Hyderabad",
                "latitude": 17.4156,
                "longitude": 78.4350,
                "items": [
                    {
                        "food_name": "Royal Hyderabadi Dum Biryani (Chicken & Veg)",
                        "food_type": "Cooked Meal",
                        "prepared": 150.0,
                        "sold": 115.0,
                        "surplus": 35.0,
                        "prep_time": now - datetime.timedelta(hours=1, minutes=30),
                        "exp_time": now + datetime.timedelta(hours=5),
                        "weather": "Sunny",
                        "festival": "Weekend Special",
                        "temp": 65.0,
                        "storage": "Hot Holding",
                        "pred_surplus": 32.5,
                        "demand": "High",
                        "risk": "Moderate",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Hot holding verified at 65°C (Above safe 60°C threshold). Prepared 1.5 hours ago."
                    },
                    {
                        "food_name": "Paneer Butter Masala & Fresh Tandoori Naan",
                        "food_type": "Cooked Meal",
                        "prepared": 80.0,
                        "sold": 55.0,
                        "surplus": 25.0,
                        "prep_time": now - datetime.timedelta(hours=2),
                        "exp_time": now + datetime.timedelta(hours=4),
                        "weather": "Sunny",
                        "festival": "None",
                        "temp": 24.0,
                        "storage": "Room Temperature",
                        "pred_surplus": 24.0,
                        "demand": "Medium",
                        "risk": "Moderate",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Stored at room temperature for 2.0 hours. Within safe 2-hour ambient holding window."
                    },
                    {
                        "food_name": "Mughlai Mutton Korma & Jeera Rice",
                        "food_type": "Cooked Meal",
                        "prepared": 65.0,
                        "sold": 45.0,
                        "surplus": 20.0,
                        "prep_time": now - datetime.timedelta(hours=1),
                        "exp_time": now + datetime.timedelta(hours=5),
                        "weather": "Sunny",
                        "festival": "None",
                        "temp": 66.0,
                        "storage": "Hot Holding",
                        "pred_surplus": 19.5,
                        "demand": "Medium",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Hot holding compliant at 66°C. Excellent condition for immediate redistribution."
                    }
                ]
            },
            {
                "email": "paradise@example.com",
                "name": "Chef Ananya Roy",
                "phone": "+91 98480 54321",
                "restaurant_name": "Paradise Heritage Kitchen",
                "location": "MG Road, Secunderabad, Hyderabad",
                "latitude": 17.4411,
                "longitude": 78.4983,
                "items": [
                    {
                        "food_name": "Dal Makhani & Fragrant Jeera Rice",
                        "food_type": "Cooked Meal",
                        "prepared": 90.0,
                        "sold": 60.0,
                        "surplus": 30.0,
                        "prep_time": now - datetime.timedelta(hours=1),
                        "exp_time": now + datetime.timedelta(hours=6),
                        "weather": "Cloudy",
                        "festival": "None",
                        "temp": 68.0,
                        "storage": "Hot Holding",
                        "pred_surplus": 28.0,
                        "demand": "Medium",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Hot holding compliant at 68°C. Freshly prepared, safe for immediate NGO pickup."
                    },
                    {
                        "food_name": "Artisan Garlic Rolls & Dinner Breads",
                        "food_type": "Bakery",
                        "prepared": 50.0,
                        "sold": 30.0,
                        "surplus": 20.0,
                        "prep_time": now - datetime.timedelta(hours=3, minutes=30),
                        "exp_time": now + datetime.timedelta(hours=20),
                        "weather": "Cloudy",
                        "festival": "None",
                        "temp": 22.0,
                        "storage": "Room Temperature",
                        "pred_surplus": 18.0,
                        "demand": "Medium",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Bakery items held in dry ambient conditions for 3.5 hours. Well within safe 24h limit."
                    },
                    {
                        "food_name": "Dum Aloo Kashmiri & Butter Roti",
                        "food_type": "Cooked Meal",
                        "prepared": 70.0,
                        "sold": 48.0,
                        "surplus": 22.0,
                        "prep_time": now - datetime.timedelta(hours=1, minutes=45),
                        "exp_time": now + datetime.timedelta(hours=5),
                        "weather": "Cloudy",
                        "festival": "None",
                        "temp": 64.0,
                        "storage": "Hot Holding",
                        "pred_surplus": 21.0,
                        "demand": "Medium",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Maintained in heated container above 60°C. Standard safety checks verified."
                    }
                ]
            },
            {
                "email": "bhavanareddychallamalla@gmail.com",
                "alt_email": "tulips@example.com",
                "name": "Chef Bhavana Reddy",
                "phone": "+91 63040 02109",
                "restaurant_name": "Tulips Multi-Cuisine Restaurant",
                "location": "Jonnagaddala Gudem, Nalgonda Highway, Hyderabad",
                "latitude": 17.3616,
                "longitude": 78.5482,
                "items": [
                    {
                        "food_name": "South Indian Deluxe Thali Meals",
                        "food_type": "Cooked Meal",
                        "prepared": 120.0,
                        "sold": 88.0,
                        "surplus": 32.0,
                        "prep_time": now - datetime.timedelta(hours=1, minutes=15),
                        "exp_time": now + datetime.timedelta(hours=5),
                        "weather": "Sunny",
                        "festival": "Normal Day",
                        "temp": 66.0,
                        "storage": "Hot Holding",
                        "pred_surplus": 30.5,
                        "demand": "High",
                        "risk": "Moderate",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Inspected at 66°C hot holding. Certified safe under FSSAI cooked meals framework."
                    },
                    {
                        "food_name": "Ghee Sambar Rice & Potato Poriyal",
                        "food_type": "Cooked Meal",
                        "prepared": 85.0,
                        "sold": 60.0,
                        "surplus": 25.0,
                        "prep_time": now - datetime.timedelta(hours=1, minutes=45),
                        "exp_time": now + datetime.timedelta(hours=4),
                        "weather": "Sunny",
                        "festival": "Normal Day",
                        "temp": 65.0,
                        "storage": "Hot Holding",
                        "pred_surplus": 23.5,
                        "demand": "Medium",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Warm distribution temperature verified. Suitable for immediate community dispatch."
                    },
                    {
                        "food_name": "Vegetable Hakka Noodles & Manchurian",
                        "food_type": "Cooked Meal",
                        "prepared": 65.0,
                        "sold": 45.0,
                        "surplus": 20.0,
                        "prep_time": now - datetime.timedelta(hours=2),
                        "exp_time": now + datetime.timedelta(hours=4),
                        "weather": "Sunny",
                        "festival": "None",
                        "temp": 25.0,
                        "storage": "Room Temperature",
                        "pred_surplus": 19.0,
                        "demand": "Medium",
                        "risk": "Moderate",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Elapsed ambient duration 2.0 hours. Recommending dispatch within 90 minutes."
                    }
                ]
            },
            {
                "email": "greenleaf@example.com",
                "name": "Chef Rakesh Joshi",
                "phone": "+91 98480 77889",
                "restaurant_name": "Green Leaf Gourmet",
                "location": "Road No. 36, Jubilee Hills, Hyderabad",
                "latitude": 17.4319,
                "longitude": 78.4073,
                "items": [
                    {
                        "food_name": "Quinoa & Roasted Veggie Buddha Bowls",
                        "food_type": "Cooked Meal",
                        "prepared": 75.0,
                        "sold": 52.0,
                        "surplus": 23.0,
                        "prep_time": now - datetime.timedelta(hours=2, minutes=30),
                        "exp_time": now + datetime.timedelta(hours=8),
                        "weather": "Sunny",
                        "festival": "None",
                        "temp": 4.0,
                        "storage": "Refrigerated",
                        "pred_surplus": 21.5,
                        "demand": "Medium",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Chilled storage temperature verified at 4.0°C (Compliant with cold-chain guidelines ≤ 5°C)."
                    },
                    {
                        "food_name": "Spinach & Corn Baked Lasagna",
                        "food_type": "Cooked Meal",
                        "prepared": 60.0,
                        "sold": 40.0,
                        "surplus": 20.0,
                        "prep_time": now - datetime.timedelta(hours=1, minutes=10),
                        "exp_time": now + datetime.timedelta(hours=5),
                        "weather": "Sunny",
                        "festival": "None",
                        "temp": 65.0,
                        "storage": "Hot Holding",
                        "pred_surplus": 18.5,
                        "demand": "Medium",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Hot holding verified at 65°C. Safe and ready for immediate food bank dispatch."
                    },
                    {
                        "food_name": "Mediterranean Hummus & Pita Platter",
                        "food_type": "Bakery",
                        "prepared": 45.0,
                        "sold": 30.0,
                        "surplus": 15.0,
                        "prep_time": now - datetime.timedelta(hours=3),
                        "exp_time": now + datetime.timedelta(hours=12),
                        "weather": "Sunny",
                        "festival": "None",
                        "temp": 5.0,
                        "storage": "Refrigerated",
                        "pred_surplus": 14.0,
                        "demand": "Low",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Refrigerated at 5°C within sealed containers. Optimal microbiological quality."
                    }
                ]
            },
            {
                "email": "dakshin@example.com",
                "name": "Chef Meenakshi Sundaram",
                "phone": "+91 98480 99001",
                "restaurant_name": "Dakshin Coastal Kitchen",
                "location": "Inorbit Mall Road, Madhapur, HITEC City, Hyderabad",
                "latitude": 17.4382,
                "longitude": 78.3888,
                "items": [
                    {
                        "food_name": "Coastal Fish Curry & Steamed Ponni Rice",
                        "food_type": "Cooked Meal",
                        "prepared": 95.0,
                        "sold": 70.0,
                        "surplus": 25.0,
                        "prep_time": now - datetime.timedelta(hours=1),
                        "exp_time": now + datetime.timedelta(hours=4),
                        "weather": "Sunny",
                        "festival": "None",
                        "temp": 67.0,
                        "storage": "Hot Holding",
                        "pred_surplus": 24.0,
                        "demand": "High",
                        "risk": "Moderate",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Thermal holding compliant at 67°C. Fast transit recommended for seafood preparations."
                    },
                    {
                        "food_name": "Malabar Parotta & Vegetable Kurma",
                        "food_type": "Cooked Meal",
                        "prepared": 70.0,
                        "sold": 50.0,
                        "surplus": 20.0,
                        "prep_time": now - datetime.timedelta(hours=1, minutes=30),
                        "exp_time": now + datetime.timedelta(hours=5),
                        "weather": "Sunny",
                        "festival": "None",
                        "temp": 64.0,
                        "storage": "Hot Holding",
                        "pred_surplus": 18.0,
                        "demand": "Medium",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Hot holding verified at 64°C. Clean inspection passed without observations."
                    },
                    {
                        "food_name": "Traditional Coconut Payasam & Sweets",
                        "food_type": "Cooked Meal",
                        "prepared": 40.0,
                        "sold": 26.0,
                        "surplus": 14.0,
                        "prep_time": now - datetime.timedelta(hours=2),
                        "exp_time": now + datetime.timedelta(hours=8),
                        "weather": "Sunny",
                        "festival": "None",
                        "temp": 4.5,
                        "storage": "Refrigerated",
                        "pred_surplus": 13.0,
                        "demand": "Low",
                        "risk": "Low",
                        "safety_status": "SAFE FOR REDISTRIBUTION",
                        "safety_reason": "Chilled dessert maintained at 4.5°C in clean food-grade catering vessels."
                    }
                ]
            }
        ]

        # Clean up any temporary dummy test users if present
        test_user = db.query(User).filter_by(email="newchef_test@example.com").first()
        if test_user:
            db.delete(test_user)
            db.commit()

        # Seed/Update each of the 5 restaurants
        for spec in restaurants_spec:
            user = db.query(User).filter_by(email=spec["email"]).first()
            if not user and "alt_email" in spec:
                user = db.query(User).filter_by(email=spec["alt_email"]).first()

            if not user:
                print(f"Creating user {spec['email']} ({spec['name']})...")
                user = User(
                    name=spec["name"],
                    email=spec["email"],
                    phone=spec["phone"],
                    role="restaurant"
                )
                user.set_password("password123")
                db.add(user)
                db.flush()
            else:
                user.name = spec["name"]
                user.phone = spec["phone"]
                user.set_password("password123")

            # Check or create Restaurant profile
            rest = db.query(Restaurant).filter_by(user_id=user.user_id).first()
            if not rest:
                print(f"Creating restaurant {spec['restaurant_name']}...")
                rest = Restaurant(
                    user_id=user.user_id,
                    restaurant_name=spec["restaurant_name"],
                    location=spec["location"],
                    contact=spec["phone"],
                    latitude=spec["latitude"],
                    longitude=spec["longitude"]
                )
                db.add(rest)
                db.flush()
            else:
                rest.restaurant_name = spec["restaurant_name"]
                rest.location = spec["location"]
                rest.contact = spec["phone"]
                rest.latitude = spec["latitude"]
                rest.longitude = spec["longitude"]
                db.flush()

            # Seed realistic food items for this restaurant if not already present
            existing_items = db.query(FoodRecord).filter_by(restaurant_id=rest.restaurant_id).all()
            existing_names = {item.food_name.lower().strip() for item in existing_items}

            for item_spec in spec["items"]:
                if item_spec["food_name"].lower().strip() not in existing_names:
                    print(f"  Adding food item: {item_spec['food_name']} for {rest.restaurant_name}...")
                    f = FoodRecord(
                        restaurant_id=rest.restaurant_id,
                        food_name=item_spec["food_name"],
                        food_type=item_spec["food_type"],
                        quantity_prepared=item_spec["prepared"],
                        quantity_sold=item_spec["sold"],
                        surplus_quantity=item_spec["surplus"],
                        preparation_time=item_spec["prep_time"],
                        expiry_time=item_spec["exp_time"],
                        weather=item_spec["weather"],
                        festival=item_spec["festival"],
                        temperature=item_spec["temp"],
                        storage_condition=item_spec["storage"]
                    )
                    db.add(f)
                    db.flush()

                    # Prediction
                    pred = Prediction(
                        food_id=f.food_id,
                        predicted_surplus=item_spec["pred_surplus"],
                        demand_level=item_spec["demand"],
                        waste_risk=item_spec["risk"],
                        confidence=0.88
                    )
                    db.add(pred)

                    # Food Safety Record
                    safe = FoodSafety(
                        food_id=f.food_id,
                        preparation_time=item_spec["prep_time"],
                        storage_condition=item_spec["storage"],
                        expiry_time=item_spec["exp_time"],
                        safety_status=item_spec["safety_status"],
                        validation_reason=item_spec["safety_reason"]
                    )
                    db.add(safe)
                    existing_names.add(item_spec["food_name"].lower().strip())

        db.commit()
        print("\nAll 5 restaurants and food records successfully verified and seeded!")

        # Print summary
        restaurants = db.query(Restaurant).all()
        print(f"\nTotal Restaurants in DB: {len(restaurants)}")
        for r in restaurants:
            count = db.query(FoodRecord).filter_by(restaurant_id=r.restaurant_id).count()
            print(f"- ID {r.restaurant_id}: {r.restaurant_name} ({r.location}) | {count} food records")

    except Exception as e:
        db.rollback()
        print(f"Error seeding 5 restaurants: {e}")
        raise e
    finally:
        db.close()

if __name__ == '__main__':
    seed_five_restaurants()
