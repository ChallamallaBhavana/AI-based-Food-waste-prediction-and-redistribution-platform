# AI-Based Food Waste Prediction and Redistribution System
## Formal Software Engineering UML & Architectural Diagrams

This document contains the standard software engineering design diagrams representing the architecture, data models, and dynamic behaviors of the platform.

---

### 1. Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors
        R["🍳 Restaurant / Food Provider"]
        N["🤝 NGO / Food Recipient"]
        A["🛡️ System Administrator"]
    end

    subgraph System Boundary: Food Rescue AI Platform
        UC1(["Register & Authenticate (JWT)"])
        UC2(["Log Daily Food Preparation"])
        UC3(["Predict Surplus via ML (Scikit-Learn)"])
        UC4(["Validate Food Safety (FSSAI Guidelines)"])
        UC5(["View Algorithmic NGO Recommendations"])
        UC6(["Dispatch Food Donation"])
        UC7(["Manage NGO Intake Capacity & Dietary Rules"])
        UC8(["Accept / Confirm Surplus Allocation"])
        UC9(["Track Live Delivery & Transit ETA"])
        UC10(["Update Delivery Timeline Status"])
        UC11(["View Waste Reduction Analytics & Impact"])
        UC12(["Manage Platform Entities & Audit Logs"])
    end

    R --> UC1
    R --> UC2
    R --> UC3
    R --> UC4
    R --> UC5
    R --> UC6
    R --> UC9
    R --> UC11

    N --> UC1
    N --> UC7
    N --> UC8
    N --> UC9
    N --> UC10
    N --> UC11

    A --> UC1
    A --> UC11
    A --> UC12
```

---

### 2. Class Diagram

```mermaid
classDiagram
    class User {
        +int user_id
        +string name
        +string email
        +string phone
        +string password_hash
        +string role
        +datetime created_at
        +set_password(pwd)
        +check_password(pwd)
        +to_dict()
    }

    class Restaurant {
        +int restaurant_id
        +int user_id
        +string restaurant_name
        +string location
        +string contact
        +float latitude
        +float longitude
        +to_dict()
    }

    class NGO {
        +int ngo_id
        +int user_id
        +string ngo_name
        +string location
        +string contact_phone
        +string food_requirement
        +float required_quantity
        +float capacity
        +string availability
        +float latitude
        +float longitude
        +to_dict()
    }

    class FoodRecord {
        +int food_id
        +int restaurant_id
        +string food_name
        +string food_type
        +float quantity_prepared
        +float quantity_sold
        +float surplus_quantity
        +datetime preparation_time
        +datetime expiry_time
        +string weather
        +string festival
        +float temperature
        +string storage_condition
        +to_dict()
    }

    class Prediction {
        +int prediction_id
        +int food_id
        +float predicted_surplus
        +datetime prediction_date
        +string demand_level
        +string waste_risk
        +float confidence
        +to_dict()
    }

    class FoodSafety {
        +int safety_id
        +int food_id
        +datetime preparation_time
        +string storage_condition
        +datetime expiry_time
        +string safety_status
        +string validation_reason
        +datetime validation_date
        +to_dict()
    }

    class Donation {
        +int donation_id
        +int food_id
        +int ngo_id
        +float donation_quantity
        +datetime donation_date
        +string status
        +string notes
        +to_dict()
    }

    class Delivery {
        +int delivery_id
        +int donation_id
        +string pickup_location
        +string destination
        +float distance
        +string estimated_time
        +string delivery_status
        +string route
        +to_dict()
    }

    class Analytics {
        +int analytics_id
        +date date
        +float total_surplus
        +float total_redistributed
        +float total_waste
        +int donation_count
        +to_dict()
    }

    User "1" --> "0..1" Restaurant : manages
    User "1" --> "0..1" NGO : operates
    Restaurant "1" --> "0..*" FoodRecord : logs
    FoodRecord "1" --> "0..*" Prediction : evaluated_by
    FoodRecord "1" --> "0..*" FoodSafety : validated_by
    FoodRecord "1" --> "0..*" Donation : allocated_as
    NGO "1" --> "0..*" Donation : receives
    Donation "1" --> "1" Delivery : triggers
```

---

### 3. Activity Diagram (Surplus Lifecycle)

```mermaid
flowchart TD
    Start([Chef Logs Daily Preparation]) --> Input[Enter Food Name, Quantity Prepared, Weather, Festival]
    Input --> CalcSurplus[System Computes Remaining Surplus: Prepared - Sold]
    CalcSurplus --> MLInference[Invoke ML Random Forest Pipeline]
    
    subgraph AI Surplus Prediction
        MLInference --> PredictSurplus[Generate Predicted Surplus kg]
        PredictSurplus --> PredictDemand[Determine Demand Level: High / Med / Low]
        PredictDemand --> PredictRisk[Determine Waste Risk: High / Mod / Low]
    end

    PredictRisk --> SafetyCheck[FSSAI Safety Validation Engine]

    subgraph FSSAI Food Safety Audit
        SafetyCheck --> TempEval{Check Storage & Temp}
        TempEval -->|Danger Zone 5-60°C & Ambient > 4 hrs| Unsafe[Status: NOT SAFE]
        TempEval -->|Ambient 2 to 4 hrs| Review[Status: NEEDS REVIEW]
        TempEval -->|Compliant Temperature & <= 2 hrs| Safe[Status: SAFE FOR REDISTRIBUTION]
    end

    Unsafe --> Discard([Mark for Composting / Do Not Donate])
    Review --> AlertReview[Flag Immediate Consumption Warning]
    Safe --> RecNGO[Compute NGO Multi-Criteria Match Scores]
    AlertReview --> RecNGO

    subgraph Recommendation & Dispatch
        RecNGO --> SortNGOs[Rank NGOs: Haversine Distance + Capacity + Dietary Rule]
        SortNGOs --> SelectNGO[Restaurant Selects Target NGO]
        SelectNGO --> CreateDonation[Generate Donation & Dispatch Record]
    end

    CreateDonation --> Routing[Compute Distance, Transit ETA & Coordinates]
    Routing --> Stepper[Dispatch Status: Pending]
    Stepper --> Accepted[NGO Accepts: Accepted]
    Accepted --> PickedUp[Driver Handover: Picked Up]
    PickedUp --> InTransit[On Route: In Transit]
    InTransit --> Delivered[Delivered to Shelter]
    Delivered --> UpdateAnalytics[Update Dashboard & Carbon Offset Metrics]
    UpdateAnalytics --> Finish([End Redistribution Flow])
```

---

### 4. Sequence Diagram (Food Logging to Delivery)

```mermaid
sequenceDiagram
    autonumber
    actor Restaurant as Restaurant Chef
    participant UI as React Frontend
    participant API as Flask Backend
    participant ML as Scikit-Learn Model
    participant Safety as FSSAI Rule Engine
    participant DB as MySQL / SQLite DB
    actor NGO as NGO Coordinator

    Restaurant->>UI: Enter daily food metrics (Qty, Sold, Weather, Festival)
    UI->>API: POST /api/food/entry
    API->>ML: predict_surplus(features)
    ML-->>API: {predicted_surplus, demand_level, waste_risk}
    API->>Safety: validate_food_safety(storage, temp, time)
    Safety-->>API: {safety_status, validation_reason}
    API->>DB: INSERT into food_records, predictions, food_safety
    DB-->>API: Record IDs
    API-->>UI: 201 Created (Food + Predictions + Safety)
    UI-->>Restaurant: Display Results Card & Safe Status

    Restaurant->>UI: Request NGO Recommendations
    UI->>API: GET /api/ngos/recommendations?surplus_quantity=35
    API->>DB: Query Active NGOs
    DB-->>API: NGO entities
    API-->>UI: Ranked NGOs (Match %, Haversine Distance, Capacity)
    Restaurant->>UI: Confirm Donation to Selected NGO

    UI->>API: POST /api/donations/create (food_id, ngo_id, qty)
    API->>DB: INSERT donation & INSERT delivery (Pending)
    DB-->>API: Delivery #ID
    API-->>UI: Donation & Route ETA Created
    UI-->>NGO: Live Notification: Incoming Donation Offer
    NGO->>UI: Accept Donation Offer
    UI->>API: PUT /api/deliveries/{id}/advance (Accepted -> Picked Up -> Delivered)
    API->>DB: UPDATE delivery_status & donation_status
    API->>DB: Recalculate daily aggregate analytics
    DB-->>API: OK
    API-->>UI: Broadcast Delivered Confirmation
```

---

### 5. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ RESTAURANTS : manages
    USERS ||--o{ NGOS : manages
    RESTAURANTS ||--o{ FOOD_RECORDS : logs
    FOOD_RECORDS ||--o{ PREDICTIONS : has
    FOOD_RECORDS ||--o{ FOOD_SAFETY : validated_by
    FOOD_RECORDS ||--o{ DONATIONS : allocated_as
    NGOS ||--o{ DONATIONS : receives
    DONATIONS ||--|| DELIVERIES : tracks

    USERS {
        int user_id PK
        string name
        string email UK
        string phone
        string password
        string role
        datetime created_at
    }

    RESTAURANTS {
        int restaurant_id PK
        int user_id FK
        string restaurant_name
        string location
        string contact
        float latitude
        float longitude
    }

    NGOS {
        int ngo_id PK
        int user_id FK
        string ngo_name
        string location
        string contact_phone
        string food_requirement
        float required_quantity
        float capacity
        string availability
        float latitude
        float longitude
    }

    FOOD_RECORDS {
        int food_id PK
        int restaurant_id FK
        string food_name
        string food_type
        float quantity_prepared
        float quantity_sold
        float surplus_quantity
        datetime preparation_time
        datetime expiry_time
        string weather
        string festival
        float temperature
        string storage_condition
        datetime created_at
    }

    PREDICTIONS {
        int prediction_id PK
        int food_id FK
        float predicted_surplus
        datetime prediction_date
        string demand_level
        string waste_risk
        float confidence
    }

    FOOD_SAFETY {
        int safety_id PK
        int food_id FK
        datetime preparation_time
        string storage_condition
        datetime expiry_time
        string safety_status
        text validation_reason
        datetime validation_date
    }

    DONATIONS {
        int donation_id PK
        int food_id FK
        int ngo_id FK
        float donation_quantity
        datetime donation_date
        string status
        string notes
    }

    DELIVERIES {
        int delivery_id PK
        int donation_id FK
        string pickup_location
        string destination
        float pickup_lat
        float pickup_lng
        float dest_lat
        float dest_lng
        text route
        float distance
        string estimated_time
        string delivery_status
        datetime created_at
        datetime updated_at
    }

    ANALYTICS {
        int analytics_id PK
        date date UK
        float total_surplus
        float total_redistributed
        float total_waste
        int donation_count
    }
```

---

### 6. Data Flow Diagram (DFD)

#### Level 0 DFD (Context Diagram)

```mermaid
flowchart TD
    subgraph External Entities
        Rest[🍳 Restaurant]
        Ngo[🤝 NGO Partner]
        Adm[🛡️ Administrator]
    end

    System((0.0 AI Food Waste Prediction & Redistribution System))

    Rest -->|Food Details, Sales, Ambient Params| System
    System -->|Surplus Predictions, Safety Verdict, Recommended NGOs| Rest

    Ngo -->|Capacity, Dietary Rules, Acceptance| System
    System -->|Donation Dispatches, ETA & Route Telemetry| Ngo

    Adm -->|Governance, Model Tuning, Query Filters| System
    System -->|Aggregate Reports, Carbon Offset KPIs, Audit Logs| Adm
```

#### Level 1 DFD (Decomposition)

```mermaid
flowchart TD
    Rest[🍳 Restaurant]
    Ngo[🤝 NGO Partner]

    P1((1.0 Daily Food Logging & Surplus Computation))
    P2((2.0 ML Surplus & Waste Risk Estimation))
    P3((3.0 FSSAI Food Safety Verification))
    P4((4.0 Multi-Factor NGO Recommendation))
    P5((5.0 Donation Allocation & Smart Dispatch))
    P6((6.0 Analytics & Carbon Impact Engine))

    D1[(D1: Food Records)]
    D2[(D2: Predictions Store)]
    D3[(D3: Safety Audits)]
    D4[(D4: NGO Directory)]
    D5[(D5: Donations & Deliveries)]
    D6[(D6: Analytics Store)]

    Rest -->|Log Preparation & Sales| P1
    P1 --> D1
    D1 --> P2
    P2 -->|Features Vector| D2
    D1 --> P3
    P3 --> D3
    D1 & D4 --> P4
    P4 -->|Ranked Match List| Rest
    Rest -->|Confirm Donation| P5
    P5 --> D5
    D5 -->|Dispatch Telemetry| Ngo
    Ngo -->|Advance Milestone| P5
    D1 & D5 --> P6
    P6 --> D6
```
