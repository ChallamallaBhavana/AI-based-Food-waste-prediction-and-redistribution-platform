import requests
from config import Config
from services.recommendation_service import haversine_distance

class TransportService:
    @staticmethod
    def calculate_delivery_route(pickup_lat, pickup_lng, dest_lat, dest_lng, pickup_name, dest_name):
        """
        Computes route distance, ETA, and coordinates list for map polyline rendering.
        Connects to Google Maps API if key is configured; otherwise generates smooth coordinates.
        """
        pickup_lat = float(pickup_lat or 17.3850)
        pickup_lng = float(pickup_lng or 78.4867)
        dest_lat = float(dest_lat or 17.4000)
        dest_lng = float(dest_lng or 78.4900)

        # Distance calculation
        dist = haversine_distance(pickup_lat, pickup_lng, dest_lat, dest_lng)
        # Average urban speed 24 km/h + 10 min dispatch/handover
        eta_minutes = max(15, round(10 + (dist / 24.0) * 60))
        estimated_time = f"{eta_minutes} mins"

        waypoints = []

        # Check for Google Maps API Key
        if Config.GOOGLE_MAPS_API_KEY:
            try:
                url = (
                    f"https://maps.googleapis.com/maps/api/directions/json?"
                    f"origin={pickup_lat},{pickup_lng}&destination={dest_lat},{dest_lng}&key={Config.GOOGLE_MAPS_API_KEY}"
                )
                res = requests.get(url, timeout=4)
                data = res.json()
                if data.get('status') == 'OK' and data.get('routes'):
                    leg = data['routes'][0]['legs'][0]
                    dist = round(leg['distance']['value'] / 1000.0, 2)
                    estimated_time = leg['duration']['text']
                    steps = leg['steps']
                    for s in steps:
                        waypoints.append([s['start_location']['lat'], s['start_location']['lng']])
                    waypoints.append([dest_lat, dest_lng])
            except Exception as e:
                print(f"Google Maps API call failed or timed out: {e}")

        # If no Google Maps points, generate realistic intermediate coordinates
        if not waypoints:
            # 5-step interpolated trajectory with minor urban curvature
            steps = 5
            for i in range(steps + 1):
                t = i / steps
                # add slight bezier curvature
                curve = 0.003 * math_sin(t * 3.14159)
                lat = pickup_lat + t * (dest_lat - pickup_lat) + curve
                lng = pickup_lng + t * (dest_lng - pickup_lng) - curve
                waypoints.append([round(lat, 6), round(lng, 6)])

        route_description = f"Route from {pickup_name} to {dest_name} via Arterial Corridor ({dist} km, ~{estimated_time})"

        return {
            'distance': dist,
            'estimated_time': estimated_time,
            'route': route_description,
            'waypoints': waypoints,
            'pickup': {'lat': pickup_lat, 'lng': pickup_lng, 'label': pickup_name},
            'destination': {'lat': dest_lat, 'lng': dest_lng, 'label': dest_name}
        }

    @staticmethod
    def get_next_valid_status(current_status):
        timeline = ['Pending', 'Accepted', 'Picked Up', 'In Transit', 'Delivered']
        if current_status not in timeline:
            return 'Pending'
        idx = timeline.index(current_status)
        if idx < len(timeline) - 1:
            return timeline[idx + 1]
        return 'Delivered'

def math_sin(x):
    import math
    return math.sin(x)
