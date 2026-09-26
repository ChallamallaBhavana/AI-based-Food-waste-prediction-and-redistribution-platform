from datetime import datetime

class SafetyService:
    @staticmethod
    def validate_food_safety(data):
        """
        Validates surplus food parameters against FSSAI food safety guidelines.

        Expected fields in data:
        - food_name: str
        - food_type: str ('Cooked Meal', 'Bakery', 'Dairy', 'Raw Vegetables', 'Meat/Gravy', etc.)
        - preparation_time: datetime or iso string
        - current_time: datetime or iso string (defaults to now)
        - storage_condition: str ('Room Temperature', 'Refrigerated', 'Deep Frozen', 'Hot Holding')
        - expiry_time: datetime or iso string (optional)
        - temperature: float (Celsius, optional)
        """
        reasons = []
        status = 'SAFE FOR REDISTRIBUTION'

        # Parse preparation time
        prep_time = data.get('preparation_time')
        if isinstance(prep_time, str):
            try:
                prep_dt = datetime.fromisoformat(prep_time.replace('Z', ''))
            except Exception:
                prep_dt = datetime.now()
        elif isinstance(prep_time, datetime):
            prep_dt = prep_time
        else:
            prep_dt = datetime.now()

        # Parse current time
        curr_time = data.get('current_time')
        if isinstance(curr_time, str):
            try:
                curr_dt = datetime.fromisoformat(curr_time.replace('Z', ''))
            except Exception:
                curr_dt = datetime.now()
        elif isinstance(curr_time, datetime):
            curr_dt = curr_time
        else:
            curr_dt = datetime.now()

        # Parse expiry time
        expiry_time = data.get('expiry_time')
        expiry_dt = None
        if isinstance(expiry_time, str) and expiry_time:
            try:
                expiry_dt = datetime.fromisoformat(expiry_time.replace('Z', ''))
            except Exception:
                expiry_dt = None
        elif isinstance(expiry_time, datetime):
            expiry_dt = expiry_time

        # Calculate elapsed hours
        elapsed_seconds = max(0, (curr_dt - prep_dt).total_seconds())
        elapsed_hours = elapsed_seconds / 3600.0

        food_type = data.get('food_type', 'Cooked Meal')
        storage = data.get('storage_condition', 'Room Temperature')
        temperature = data.get('temperature')
        if temperature is not None and str(temperature).strip() != '':
            try:
                temperature = float(temperature)
            except ValueError:
                temperature = None

        # Rule 1: Expiry date check
        if expiry_dt:
            if curr_dt > expiry_dt:
                status = 'NOT SAFE FOR REDISTRIBUTION'
                reasons.append(f"Food item has exceeded its declared expiry/use-by threshold ({expiry_dt.strftime('%Y-%m-%d %H:%M')}).")
            elif (expiry_dt - curr_dt).total_seconds() < 2 * 3600:
                if status != 'NOT SAFE FOR REDISTRIBUTION':
                    status = 'NEEDS REVIEW'
                reasons.append(f"Expiry window is tight (less than 2 hours remaining until {expiry_dt.strftime('%H:%M')}). Expedited pickup required.")

        # Rule 2: Temperature Danger Zone (FSSAI 5°C to 60°C)
        if temperature is not None:
            if storage == 'Hot Holding':
                if temperature < 60.0:
                    status = 'NOT SAFE FOR REDISTRIBUTION'
                    reasons.append(f"Hot holding temperature of {temperature}°C is below the FSSAI safe hot minimum (60°C - 63°C), risking bacterial growth.")
                else:
                    reasons.append(f"Hot holding verified at {temperature}°C (Compliant with >= 60°C warm storage standard).")
            elif storage == 'Refrigerated':
                if temperature > 8.0:
                    if status != 'NOT SAFE FOR REDISTRIBUTION':
                        status = 'NEEDS REVIEW'
                    reasons.append(f"Refrigeration temperature of {temperature}°C exceeds optimal chilling range (≤ 5°C).")
                else:
                    reasons.append(f"Chilled storage temperature verified at {temperature}°C (Compliant with cold-chain guidelines).")
            elif storage == 'Deep Frozen':
                if temperature > -10.0:
                    if status != 'NOT SAFE FOR REDISTRIBUTION':
                        status = 'NEEDS REVIEW'
                    reasons.append(f"Freezer temperature is {temperature}°C (Ideal standard is ≤ -18°C).")

        # Rule 3: FSSAI 2-Hour / 4-Hour Rule for Ambient (Room Temperature) Perishables
        if storage == 'Room Temperature':
            if food_type in ['Cooked Meal', 'Dairy', 'Meat/Gravy']:
                if elapsed_hours > 4.0:
                    status = 'NOT SAFE FOR REDISTRIBUTION'
                    reasons.append(f"Food has been stored at room temperature for {elapsed_hours:.1f} hours. Under FSSAI guidelines, perishable cooked meals exceeding 4 hours at ambient temperature must not be redistributed.")
                elif elapsed_hours > 2.0:
                    if status != 'NOT SAFE FOR REDISTRIBUTION':
                        status = 'NEEDS REVIEW'
                    reasons.append(f"Food has been at room temperature for {elapsed_hours:.1f} hours (2-4 hour window). Safe only for immediate, direct redistribution without further holding.")
                else:
                    reasons.append(f"Prepared {elapsed_hours:.1f} hours ago. Within the safe 2-hour ambient window.")
            elif food_type == 'Bakery':
                if elapsed_hours > 24.0:
                    status = 'NOT SAFE FOR REDISTRIBUTION'
                    reasons.append(f"Bakery goods exceeded 24 hours at room temperature.")
                elif elapsed_hours > 12.0:
                    if status != 'NOT SAFE FOR REDISTRIBUTION':
                        status = 'NEEDS REVIEW'
                    reasons.append("Bakery item is over 12 hours old. Sensory inspection recommended.")
                else:
                    reasons.append(f"Bakery items within acceptable shelf-life ({elapsed_hours:.1f} hrs elapsed).")
            else: # Raw vegetables or dry rations
                if elapsed_hours > 36.0:
                    if status != 'NOT SAFE FOR REDISTRIBUTION':
                        status = 'NEEDS REVIEW'
                    reasons.append(f"Elapsed time is {elapsed_hours:.1f} hours. Visual quality check recommended.")
                else:
                    reasons.append("Uncooked / low-risk food within standard ambient shelf duration.")

        elif storage == 'Refrigerated':
            if food_type in ['Cooked Meal', 'Dairy', 'Meat/Gravy']:
                if elapsed_hours > 36.0:
                    status = 'NOT SAFE FOR REDISTRIBUTION'
                    reasons.append(f"Refrigerated cooked food has exceeded 36 hours ({elapsed_hours:.1f} hrs elapsed). FSSAI recommends max 24-36 hrs for donated chilled meals.")
                elif elapsed_hours > 24.0:
                    if status != 'NOT SAFE FOR REDISTRIBUTION':
                        status = 'NEEDS REVIEW'
                    reasons.append(f"Refrigerated food is {elapsed_hours:.1f} hours old. Requires reheating verification prior to serving.")
                else:
                    reasons.append(f"Refrigerated item safely held for {elapsed_hours:.1f} hours (Within permissible 24-hour limit).")

        elif storage == 'Deep Frozen':
            if elapsed_hours > 168.0: # 7 days
                if status != 'NOT SAFE FOR REDISTRIBUTION':
                    status = 'NEEDS REVIEW'
                reasons.append(f"Frozen item has been held for {elapsed_hours/24:.1f} days. Thaw and consume immediately upon dispatch.")
            else:
                reasons.append(f"Frozen inventory safely stored within weekly cycle ({elapsed_hours/24:.1f} days).")

        # Summary justification
        validation_reason = " | ".join(reasons) if reasons else "Complies with standard FSSAI temperature and shelf-life safety benchmarks."

        return {
            'safety_status': status,
            'validation_reason': validation_reason,
            'reasons_list': reasons,
            'elapsed_hours': round(elapsed_hours, 1),
            'fssai_disclaimer': 'Application-level guidance aligned with FSSAI safe food donation practices. Not a certified laboratory chemical/microbiological test.',
            'validation_date': curr_dt.isoformat()
        }
