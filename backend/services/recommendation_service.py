import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in kilometers between two geo points using Haversine formula."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class RecommendationService:
    @staticmethod
    def calculate_match(surplus_quantity, food_name, food_type, rest_lat, rest_lng, ngos):
        """
        Calculates multi-criteria recommendation scores for NGOs given surplus parameters.
        Returns sorted list of NGOs with match percentages and breakdowns.
        """
        results = []
        rest_lat = float(rest_lat or 17.3850)
        rest_lng = float(rest_lng or 78.4867)

        for ngo in ngos:
            ngo_dict = ngo.to_dict() if hasattr(ngo, 'to_dict') else dict(ngo)
            ngo_lat = float(ngo_dict.get('latitude') or 17.3950)
            ngo_lng = float(ngo_dict.get('longitude') or 78.4967)

            # 1. Distance Calculation
            dist = haversine_distance(rest_lat, rest_lng, ngo_lat, ngo_lng)

            # Proximity Score (Max 25 pts)
            if dist <= 3.0:
                dist_score = 25.0
            elif dist <= 8.0:
                dist_score = 20.0
            elif dist <= 15.0:
                dist_score = 14.0
            elif dist <= 25.0:
                dist_score = 8.0
            else:
                dist_score = 4.0

            # 2. Availability Score (Max 20 pts)
            avail = ngo_dict.get('availability', 'Available')
            if avail == 'Available':
                avail_score = 20.0
            elif avail == 'Busy':
                avail_score = 8.0
            else:
                avail_score = 0.0

            # 3. Food Requirement Match (Max 30 pts)
            ngo_req = ngo_dict.get('food_requirement', 'All Cooked Meals').lower()
            food_type_lower = str(food_type).lower()
            food_name_lower = str(food_name).lower()

            if 'all' in ngo_req:
                req_score = 30.0
                req_match_note = "Accepts all food varieties"
            elif 'veg' in ngo_req and ('chicken' not in food_name_lower and 'meat' not in food_name_lower):
                req_score = 30.0
                req_match_note = "Dietary preference matched (Vegetarian)"
            elif 'bakery' in ngo_req and 'bakery' in food_type_lower:
                req_score = 30.0
                req_match_note = "Category match (Bakery)"
            elif 'dry' in ngo_req and 'dry' in food_type_lower:
                req_score = 30.0
                req_match_note = "Category match (Dry rations)"
            else:
                req_score = 12.0
                req_match_note = "General compatibility"

            # 4. Capacity & Quantity Match (Max 25 pts)
            capacity = float(ngo_dict.get('capacity', 100))
            req_qty = float(ngo_dict.get('required_quantity', 50))
            surplus_qty = float(surplus_quantity or 10)

            if capacity >= surplus_qty:
                # Capacity is sufficient
                ratio = min(1.0, surplus_qty / (req_qty if req_qty > 0 else 50))
                cap_score = 18.0 + (ratio * 7.0)
                cap_note = f"Full capacity available ({capacity} kg max)"
            else:
                # Over-capacity penalty
                cap_score = max(5.0, 25.0 - ((surplus_qty - capacity) * 0.4))
                cap_note = f"Partial intake capacity ({capacity} kg available)"

            total_score = min(100.0, round(dist_score + avail_score + req_score + cap_score, 1))

            # Estimated transport duration in minutes (avg 25 km/h city speed + 10 min pickup)
            eta_mins = round(10 + (dist / 25.0) * 60)

            ngo_dict['distance_km'] = dist
            ngo_dict['match_percentage'] = total_score
            ngo_dict['eta_minutes'] = eta_mins
            ngo_dict['match_reasons'] = [
                f"{dist} km away (~{eta_mins} mins transit)",
                req_match_note,
                cap_note,
                f"Status: {avail}"
            ]
            results.append(ngo_dict)

        # Sort highest match percentage first
        results.sort(key=lambda x: x['match_percentage'], reverse=True)
        return results
