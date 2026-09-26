# AI-Based Food Waste Prediction and Redistribution System
### Final-Year B.Tech Data Science Capstone Project

An end-to-end full-stack web application designed to eliminate edible food waste by combining **Machine Learning Surplus Prediction (Scikit-Learn)**, **FSSAI-Aligned Food Safety Rules**, **Algorithmic Multi-Factor NGO Matching (Haversine Formula)**, and **Interactive Delivery Tracking with Route Telemetry**.

---

## 🌟 Key Modules & Engineering Features

| Module | Core Responsibility | Underlying Technologies |
| :--- | :--- | :--- |
| **Module 1: AI Surplus Prediction** | Predicts expected leftover food volume and evaluates waste risk level from preparation quantities, historical demand velocity, weather, and festival surge factors. | Scikit-learn, Random Forest Regressor & Classifier, Pandas, NumPy |
| **Module 2: Food Safety Validation** | Evaluates thermal danger zones (5°C–60°C), shelf-life limits, and the 2h/4h ambient holding threshold based on FSSAI food donation guidelines. | FSSAI Guideline Rule Engine |
| **Module 3: Algorithmic NGO Matching** | Computes multi-criteria match percentages considering Haversine geodistance, intake capacity, dietary requirement compatibility, and live availability. | Haversine Distance, Algorithmic Scoring Pipeline |
| **Module 4: Smart Transport & Tracking** | Generates dispatch records with interactive Leaflet map routes, transit ETAs, and a 5-step milestone timeline stepper (*Pending → Accepted → Picked Up → In Transit → Delivered*). | Leaflet.js, OpenStreetMap, Route Interpolator |
| **Module 5: Operational Analytics** | Real-time aggregate dashboards featuring 14-day line charts, 6-month bars, category distributions, festival surge analyses, and carbon offset calculations. | Chart.js, React-Chartjs-2, Dynamic SQL Aggregations |

---

## 🏗️ System Architecture

```
4-1 mini project/
├── backend/
│   ├── app.py                 # Flask app entry point, CORS, Blueprints, Auto-Seed
│   ├── config.py              # Environment variables & fallback configurations
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment secrets (JWT, Port, DB URI)
│   ├── test_backend.py        # Automated test suite for all 8 core API modules
│   ├── database/
│   │   ├── db.py              # SQLAlchemy engine with SQLite auto-fallback
│   │   ├── schema.sql         # Pure MySQL CREATE TABLE statements
│   │   ├── seed.sql           # Pure MySQL INSERT seed statements
│   │   └── seed_data.py       # Python automated seeder for demo accounts & analytics
│   ├── ml/
│   │   ├── dataset_generator.py # Generates realistic historical restaurant records
│   │   ├── train_model.py     # Trains RandomForest pipeline & exports .joblib
│   │   ├── surplus_model.joblib # Serialized trained Scikit-learn model artifact
│   │   └── food_waste_dataset.csv # 3,000-sample training dataset
│   ├── models/                # SQLAlchemy ORM models (9 tables)
│   ├── routes/                # Blueprint API endpoints
│   ├── services/              # ML, Safety, Recommendation & Transport business logic
│   └── utils/                 # JWT authentication middleware
├── frontend/
│   ├── index.html             # Google fonts & Leaflet stylesheets
│   ├── package.json           # React, Vite, Lucide icons, Chart.js, Leaflet
│   ├── vite.config.js         # Vite configuration with /api backend proxy
│   └── src/
│       ├── App.jsx            # Dynamic routing for 12 requested pages
│       ├── main.jsx           # React DOM root
│       ├── index.css          # Modern SaaS CSS with emerald design theme
│       ├── components/        # Navbar, Sidebar, StatCard, StatusBadge, Modal, RouteMap
│       ├── context/           # AuthContext (JWT state & demo account switcher)
│       ├── pages/             # All 12 requested pages
│       └── services/          # Centralized API fetch client
└── docs/
    └── system_diagrams.md     # Use Case, Class, Activity, Sequence, ER, DFD diagrams
```

---

## 🚀 Quick Setup & Installation Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & **npm**

---

### Step 1: Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. *(Optional)* Retrain the Machine Learning model:
   ```bash
   python ml/train_model.py
   ```
   > Note: A trained model artifact `surplus_model.joblib` and dataset are pre-generated.

4. Run backend automated verification tests:
   ```bash
   python test_backend.py
   ```
   *(All 8 test suites will pass: Auth, ML Predict, Safety, NGO Matching, Analytics, Deliveries)*

5. Start the Flask server:
   ```bash
   python app.py
   ```
   Backend runs on `http://localhost:5000` and automatically initializes tables and seed data.

---

### Step 2: Database Configuration (MySQL / SQLite)

- **Instant Zero-Config Mode (Default):** The application defaults to SQLite (`food_waste.db`) so you can run the demonstration without installing or starting MySQL.
- **MySQL Mode:**
  1. Open MySQL Workbench or CLI and run:
     ```sql
     SOURCE backend/database/schema.sql;
     SOURCE backend/database/seed.sql;
     ```
  2. In `backend/.env`, set your connection string:
     ```env
     DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/food_waste_db
     ```
  3. Restart the backend.

---

### Step 3: Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

## 🔑 Pre-Configured Demo Accounts for Project Viva

The application includes an **Instant Demo Switcher** in the top navigation bar, plus one-click credentials on the Login page:

| Role | Name | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- | :--- |
| **Restaurant** | Chef Vikram Sharma | `restaurant@example.com` | `password123` | Restaurant Dashboard, Food Entry, Safety Audit, NGO Match, Donations |
| **NGO** | Dr. Radhika Nair | `ngo@example.com` | `password123` | NGO Dashboard, Donations Inbox, Fleet Tracking, Intake Capacity |
| **Admin** | System Administrator | `admin@example.com` | `password123` | Platform Users, Restaurant Roster, NGO Directory, ML Health Reports |

---

## 📋 Recommended Presentation / Demo Flow for Evaluators

1. **Landing Page (`/`):** Point out project title, UN SDG 12.3 alignment, and the 4 Core Pillars.
2. **Restaurant Daily Preparation (`/food-entry`):**
   - Enter today's meal (e.g., *Chicken Dum Biryani*, 150 kg prepared, 110 kg sold).
   - Click **"Predict Surplus with AI"** — show the ML result card with Scikit-learn Random Forest regression and risk assessment.
   - Click **"Save & Evaluate Record"**.
3. **Food Safety Check (`/food-safety`):**
   - Test ambient temperature vs. refrigerated holding times.
   - Show how the rule engine enforces FSSAI's 2-hour/4-hour rule and displays actionable reasons.
4. **Algorithmic NGO Matching (`/ngo-recommendations`):**
   - Review ranked NGOs sorted by match percentage.
   - Point out Haversine geodistance, intake capacities, and match reasons.
   - Click **"Select NGO & Create Donation"** and confirm dispatch.
5. **Smart Transportation Tracking (`/deliveries`):**
   - View the interactive Leaflet route map with pickup and destination pins.
   - Click **"Simulate Next Milestone"** to advance the 5-step status stepper (*Pending → Accepted → Picked Up → In Transit → Delivered*).
6. **NGO Recipient Dashboard (`/ngo/dashboard`):**
   - Switch role to NGO from the top switcher.
   - Show the incoming donation offer in the inbox and accept the dispatch.
7. **Analytics Dashboard (`/analytics`):**
   - Highlight the 14-day daily trend, 6-month monthly surplus vs. saved bars, and carbon emission savings (2.5 kg CO2e per kg saved).

---

## 📡 REST API Reference

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/login` | POST | Public | Authenticate user & receive JWT token |
| `/api/auth/register` | POST | Public | Register restaurant, NGO, or admin |
| `/api/auth/me` | GET | Authenticated | Retrieve authenticated user profile |
| `/api/food/entry` | POST | Restaurant | Log daily food preparation & run ML evaluation |
| `/api/food/records` | GET | Authenticated | List food preparation records |
| `/api/predict/calculate` | POST | Public | Standalone Scikit-learn surplus prediction |
| `/api/safety/validate` | POST | Public | Evaluate storage against FSSAI guidelines |
| `/api/ngos/recommendations`| GET | Public | Ranked NGO matching using Haversine formula |
| `/api/donations/create` | POST | Restaurant | Allocate surplus food and generate delivery order |
| `/api/deliveries` | GET | Authenticated | Fetch active delivery telemetry |
| `/api/deliveries/<id>/advance`| PUT | Authenticated | Advance delivery through timeline milestones |
| `/api/analytics/summary` | GET | Public | KPI metrics (surplus, saved, carbon offsets) |
| `/api/analytics/charts` | GET | Public | Time-series datasets for Chart.js |
| `/api/admin/overview` | GET | Admin | Central governance entity counts |
| `/api/admin/reports` | GET | Admin | System health and ML validation audit logs |

---

## 📜 Regulatory Notice
*The food safety guidelines implemented in this system are structured around standard FSSAI hygienic practices for educational and project evaluation purposes, and do not constitute official statutory FSSAI certification.*
