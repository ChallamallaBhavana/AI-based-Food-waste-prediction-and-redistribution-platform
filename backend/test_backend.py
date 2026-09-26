import json
from app import create_app

def run_tests():
    app = create_app()
    client = app.test_client()

    print("\n--- 1. Testing Health Check ---")
    res = client.get('/api/health')
    print("Health response:", res.status_code, res.get_json())
    assert res.status_code == 200

    print("\n--- 2. Testing Demo Accounts ---")
    res = client.get('/api/auth/demo-accounts')
    print("Demo accounts:", res.status_code, len(res.get_json().get('accounts', [])))
    assert res.status_code == 200

    print("\n--- 3. Testing Restaurant Login ---")
    res = client.post('/api/auth/login', json={
        'email': 'restaurant@example.com',
        'password': 'password123',
        'role': 'restaurant'
    })
    data = res.get_json()
    print("Login status:", res.status_code, "User:", data.get('user', {}).get('name'))
    assert res.status_code == 200
    token = data['token']
    headers = {'Authorization': f'Bearer {token}'}

    print("\n--- 4. Testing AI Surplus Prediction ---")
    pred_res = client.post('/api/predict/calculate', json={
        'food_name': 'Hyderabadi Chicken Dum Biryani',
        'food_type': 'Cooked Meal',
        'quantity_prepared': 120,
        'previous_demand': 90,
        'date': '2026-09-22',
        'weather': 'Sunny',
        'festival': 'Weekend Special'
    })
    pdata = pred_res.get_json()
    print("Prediction result:", pred_res.status_code, pdata)
    assert pred_res.status_code == 200
    assert 'predicted_surplus' in pdata
    assert 'demand_level' in pdata
    assert 'waste_risk' in pdata

    print("\n--- 5. Testing Food Safety Validation ---")
    safe_res = client.post('/api/safety/validate', json={
        'food_name': 'Paneer Butter Masala',
        'food_type': 'Cooked Meal',
        'storage_condition': 'Room Temperature',
        'preparation_time': '2026-09-21T14:00:00',
        'current_time': '2026-09-21T15:30:00',
        'temperature': 26.0
    })
    sdata = safe_res.get_json()
    print("Safety result:", safe_res.status_code, sdata.get('safety_status'), "| Reason:", sdata.get('validation_reason'))
    assert safe_res.status_code == 200
    assert sdata.get('safety_status') == 'SAFE FOR REDISTRIBUTION'

    print("\n--- 6. Testing NGO Recommendations ---")
    rec_res = client.get('/api/ngos/recommendations?surplus_quantity=30&food_name=Biryani&food_type=Cooked+Meal')
    rdata = rec_res.get_json()
    print("Recommended NGOs:", rec_res.status_code, "Count:", len(rdata.get('recommended_ngos', [])))
    if rdata.get('recommended_ngos'):
        top = rdata['recommended_ngos'][0]
        print(f"Top recommendation: {top['ngo_name']} (Match: {top['match_percentage']}%, Distance: {top['distance_km']} km)")
    assert rec_res.status_code == 200

    print("\n--- 7. Testing Analytics Summary ---")
    ana_res = client.get('/api/analytics/summary')
    adata = ana_res.get_json()
    print("Analytics summary:", ana_res.status_code, adata)
    assert ana_res.status_code == 200

    print("\n--- 8. Testing Deliveries & Status Advancement ---")
    del_res = client.get('/api/deliveries', headers=headers)
    del_list = del_res.get_json()
    print("Deliveries count:", len(del_list))
    if del_list:
        first_id = del_list[0]['delivery_id']
        curr_status = del_list[0]['delivery_status']
        print(f"Delivery #{first_id} status: {curr_status}")
        adv_res = client.put(f'/api/deliveries/{first_id}/advance', headers=headers)
        print("Advanced status result:", adv_res.status_code, adv_res.get_json().get('delivery_status'))
        assert adv_res.status_code == 200

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY! ALL MODULES FULLY OPERATIONAL!")

if __name__ == '__main__':
    run_tests()
