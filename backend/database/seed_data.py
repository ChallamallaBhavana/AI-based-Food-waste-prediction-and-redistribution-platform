import datetime
from database.db import SessionLocal, init_db
from models.user import User
from models.restaurant import Restaurant
from models.ngo import NGO
from models.food_record import FoodRecord
from models.prediction import Prediction
from models.food_safety import FoodSafety
from models.donation import Donation
from models.delivery import Delivery
from models.analytics import Analytics
from services.transport_service import TransportService

def seed_all():
    print("Initializing tables...")
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains records. Skipping seed.")
            return

        print("Seeding initial demo data...")

        # 1. Users
        admin_user = User(
            name="System Administrator",
            email="admin@example.com",
            phone="+91 98765 43210",
            role="admin"
        )
        admin_user.set_password("password123")

        rest_user1 = User(
            name="Chef Vikram Sharma",
            email="restaurant@example.com",
            phone="+91 98480 12345",
            role="restaurant"
        )
        rest_user1.set_password("password123")

        rest_user2 = User(
            name="Chef Ananya Roy",
            email="paradise@example.com",
            phone="+91 98480 54321",
            role="restaurant"
        )
        rest_user2.set_password("password123")

        rest_user3 = User(
            name="Chef Bhavana Reddy",
            email="tulips@example.com",
            phone="+91 63040 02109",
            role="restaurant"
        )
        rest_user3.set_password("password123")

        rest_user4 = User(
            name="Chef Rakesh Joshi",
            email="greenleaf@example.com",
            phone="+91 98480 77889",
            role="restaurant"
        )
        rest_user4.set_password("password123")

        rest_user5 = User(
            name="Chef Meenakshi Sundaram",
            email="dakshin@example.com",
            phone="+91 98480 99001",
            role="restaurant"
        )
        rest_user5.set_password("password123")

        ngo_user1 = User(
            name="Dr. Radhika Nair",
            email="ngo@example.com",
            phone="+91 97000 11223",
            role="ngo"
        )
        ngo_user1.set_password("password123")

        ngo_user2 = User(
            name="Karthik Verma",
            email="robinhood@example.com",
            phone="+91 97000 44556",
            role="ngo"
        )
        ngo_user2.set_password("password123")

        db.add_all([admin_user, rest_user1, rest_user2, rest_user3, rest_user4, rest_user5, ngo_user1, ngo_user2])
        db.flush()

        # 2. Restaurants
        rest1 = Restaurant(
            user_id=rest_user1.user_id,
            restaurant_name="Royal Spice Grand",
            location="Road No. 12, Banjara Hills, Hyderabad",
            contact="+91 98480 12345",
            latitude=17.4156,
            longitude=78.4350
        )
        rest2 = Restaurant(
            user_id=rest_user2.user_id,
            restaurant_name="Paradise Heritage Kitchen",
            location="MG Road, Secunderabad, Hyderabad",
            contact="+91 98480 54321",
            latitude=17.4411,
            longitude=78.4983
        )
        rest3 = Restaurant(
            user_id=rest_user3.user_id,
            restaurant_name="Tulips Multi-Cuisine Restaurant",
            location="Jonnagaddala Gudem, Nalgonda Highway, Hyderabad",
            contact="+91 63040 02109",
            latitude=17.3616,
            longitude=78.5482
        )
        rest4 = Restaurant(
            user_id=rest_user4.user_id,
            restaurant_name="Green Leaf Gourmet",
            location="Road No. 36, Jubilee Hills, Hyderabad",
            contact="+91 98480 77889",
            latitude=17.4319,
            longitude=78.4073
        )
        rest5 = Restaurant(
            user_id=rest_user5.user_id,
            restaurant_name="Dakshin Coastal Kitchen",
            location="Inorbit Mall Road, Madhapur, HITEC City, Hyderabad",
            contact="+91 98480 99001",
            latitude=17.4382,
            longitude=78.3888
        )
        db.add_all([rest1, rest2, rest3, rest4, rest5])
        db.flush()

        # 3. NGOs
        ngo1 = NGO(
            user_id=ngo_user1.user_id,
            ngo_name="Annapurna Seva Trust",
            location="Near Apollo Hospital, Jubilee Hills, Hyderabad",
            contact_phone="+91 97000 11223",
            food_requirement="All Cooked Meals",
            required_quantity=60.0,
            capacity=120.0,
            availability="Available",
            latitude=17.4319,
            longitude=78.4073
        )
        ngo2 = NGO(
            user_id=ngo_user2.user_id,
            ngo_name="Robin Hood Army Youth Chapter",
            location="Madhapur Metro Station Hub, Hyderabad",
            contact_phone="+91 97000 44556",
            food_requirement="All Cooked Meals",
            required_quantity=80.0,
            capacity=150.0,
            availability="Available",
            latitude=17.4483,
            longitude=78.3915
        )
        ngo3 = NGO(
            user_id=None,
            ngo_name="Akshaya Patra Community Centre",
            location="Koti Women's College Road, Hyderabad",
            contact_phone="+91 98123 99887",
            food_requirement="Vegetarian Only",
            required_quantity=100.0,
            capacity=250.0,
            availability="Available",
            latitude=17.3871,
            longitude=78.4917
        )
        ngo4 = NGO(
            user_id=None,
            ngo_name="Sneha Shelter for Homeless",
            location="Ameerpet Cross Roads, Hyderabad",
            contact_phone="+91 99554 11223",
            food_requirement="Cooked Meals & Bakery",
            required_quantity=45.0,
            capacity=90.0,
            availability="Available",
            latitude=17.4375,
            longitude=78.4483
        )
        db.add_all([ngo1, ngo2, ngo3, ngo4])
        db.flush()

        # 4. Food Records & Predictions & Safety
        now = datetime.datetime.utcnow()

        foods_data = [
            {
                "restaurant": rest1,
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
                "restaurant": rest1,
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
                "restaurant": rest2,
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
                "safety_reason": "Hot holding compliant at 68°C. Immediate consumption optimal."
            },
            {
                "restaurant": rest2,
                "food_name": "Artisan Garlic Rolls & Dinner Breads",
                "food_type": "Bakery",
                "prepared": 50.0,
                "sold": 30.0,
                "surplus": 20.0,
                "prep_time": now - datetime.timedelta(hours=4),
                "exp_time": now + datetime.timedelta(hours=20),
                "weather": "Sunny",
                "festival": "None",
                "temp": 22.0,
                "storage": "Room Temperature",
                "pred_surplus": 18.0,
                "demand": "Medium",
                "risk": "Low",
                "safety_status": "SAFE FOR REDISTRIBUTION",
                "safety_reason": "Bakery items held in dry ambient conditions for 4 hours. Well within 24h limit."
            },
            {
                "restaurant": rest3,
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
                "restaurant": rest3,
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
                "restaurant": rest4,
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
                "restaurant": rest4,
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
                "restaurant": rest5,
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
                "restaurant": rest5,
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
            }
        ]

        created_foods = []
        for item in foods_data:
            f = FoodRecord(
                restaurant_id=item["restaurant"].restaurant_id,
                food_name=item["food_name"],
                food_type=item["food_type"],
                quantity_prepared=item["prepared"],
                quantity_sold=item["sold"],
                surplus_quantity=item["surplus"],
                preparation_time=item["prep_time"],
                expiry_time=item["exp_time"],
                weather=item["weather"],
                festival=item["festival"],
                temperature=item["temp"],
                storage_condition=item["storage"]
            )
            db.add(f)
            db.flush()

            # Prediction
            pred = Prediction(
                food_id=f.food_id,
                predicted_surplus=item["pred_surplus"],
                demand_level=item["demand"],
                waste_risk=item["risk"],
                confidence=0.89
            )
            db.add(pred)

            # Safety
            safe = FoodSafety(
                food_id=f.food_id,
                preparation_time=item["prep_time"],
                storage_condition=item["storage"],
                expiry_time=item["exp_time"],
                safety_status=item["safety_status"],
                validation_reason=item["safety_reason"]
            )
            db.add(safe)
            created_foods.append(f)

        db.flush()

        # 5. Donations & Deliveries
        # Donation 1: In Transit
        d1 = Donation(
            food_id=created_foods[0].food_id,
            ngo_id=ngo1.ngo_id,
            donation_quantity=30.0,
            status="In Transit",
            notes="Hot meals ready in insulated containers"
        )
        db.add(d1)
        db.flush()

        deliv1 = Delivery(
            donation_id=d1.donation_id,
            pickup_location=rest1.location,
            destination=ngo1.location,
            pickup_lat=rest1.latitude,
            pickup_lng=rest1.longitude,
            dest_lat=ngo1.latitude,
            dest_lng=ngo1.longitude,
            route="Via Banjara Hills Rd 12 -> Jubilee Hills Checkpost",
            distance=4.2,
            estimated_time="18 mins",
            delivery_status="In Transit"
        )
        db.add(deliv1)

        # Donation 2: Delivered
        d2 = Donation(
            food_id=created_foods[1].food_id,
            ngo_id=ngo2.ngo_id,
            donation_quantity=22.0,
            status="Delivered",
            notes="Direct dispatch to youth volunteers"
        )
        db.add(d2)
        db.flush()

        deliv2 = Delivery(
            donation_id=d2.donation_id,
            pickup_location=rest1.location,
            destination=ngo2.location,
            pickup_lat=rest1.latitude,
            pickup_lng=rest1.longitude,
            dest_lat=ngo2.latitude,
            dest_lng=ngo2.longitude,
            route="Via Hitec City Flyover -> Madhapur Main Road",
            distance=6.8,
            estimated_time="24 mins",
            delivery_status="Delivered"
        )
        db.add(deliv2)

        # 6. Analytics Records (14 days trend)
        today = datetime.date.today()
        base_surplus = [42.0, 38.5, 45.0, 52.0, 48.0, 65.0, 72.0, 40.0, 36.0, 44.0, 58.0, 50.0, 62.0, 68.0]
        base_redist =  [34.0, 32.0, 38.0, 44.0, 40.0, 56.0, 62.0, 32.0, 30.0, 37.0, 48.0, 42.0, 54.0, 60.0]

        for i in range(14):
            day_date = today - datetime.timedelta(days=(13 - i))
            surp = base_surplus[i]
            redist = base_redist[i]
            waste = round(surp - redist, 1)
            cnt = 2 if surp < 50 else 3

            an = Analytics(
                date=day_date,
                total_surplus=surp,
                total_redistributed=redist,
                total_waste=waste,
                donation_count=cnt
            )
            db.add(an)

        db.commit()
        print("Database seed completed successfully with realistic records!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == '__main__':
    seed_all()
