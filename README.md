# ❤️ GuardianHealth - Elderly Health Monitoring System

**A complete full-stack Progressive Web Application for elderly health monitoring, emergency response, and intelligent voice assistance.**

---

## 🎯 Project Overview

GuardianHealth is a comprehensive health monitoring system designed specifically for elderly users. It combines machine learning-based risk prediction, real-time location tracking, emergency response features, and intelligent voice assistance to provide a complete safety and health management solution.

### Key Features

✅ **Health Risk Prediction**
- Real-time heart attack risk assessment using logistic regression
- Input: Age, Systolic BP, Diastolic BP, Heart Rate
- Output: Low, Medium, or High risk with probability scores
- Rule-based safety overrides for critical conditions

✅ **Emergency Response System**
- One-touch emergency alert activation
- Live location sharing via Web Share API or clipboard
- Emergency contact management (add/remove/call)
- Nearby hospital finder with map integration

✅ **Intelligent Voice Assistant**
- Automatic voice alerts for high-risk conditions
- Continuous supportive guidance during emergencies
- Calming instructions for potentially unconscious users
- Uses browser's SpeechSynthesis API

✅ **Location & Map Features**
- Real-time location tracking using Geolocation API
- Interactive maps powered by Leaflet + OpenStreetMap
- Nearby hospitals display with distance calculation
- Direct calling functionality for hospitals and contacts

✅ **Health Tracking**
- Visual health trends using Chart.js
- Historical data storage in LocalStorage
- Blood pressure and heart rate trend analysis
- Complete health history with risk assessments

✅ **Modern UI/UX**
- Dark/Light mode toggle
- Large buttons and clear typography for elderly users
- Fully responsive design (mobile + desktop)
- Smooth animations and transitions
- Medical dashboard theme

✅ **Progressive Web App (PWA)**
- Installable on mobile devices
- Offline support via service worker
- App-like experience with manifest.json
- Can be converted to native mobile apps

---

## 📁 Project Structure

```
GuardianHealth/
├── index.html           # Main HTML file with complete UI
├── style.css            # Comprehensive stylesheet with dark/light mode
├── script.js            # Frontend JavaScript with all features
├── backend.py           # Flask API server for predictions
├── heart_model.py       # ML model training script
├── model_weights.json   # Trained model weights (auto-generated)
├── manifest.json        # PWA manifest file
├── sw.js               # Service worker for offline support
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

---

## 🚀 Quick Start Guide

### Prerequisites

- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for maps and hospital data)

### Installation Steps

#### 1. Clone or Download the Repository

```bash
git clone https://github.com/Swamy-kr17/energy-consumption-prediction.git
cd energy-consumption-prediction
```

#### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

The requirements include:
- Flask (Web framework)
- Flask-CORS (Cross-origin resource sharing)
- NumPy (Numerical computations)
- Pandas (Data manipulation)
- Scikit-learn (Machine learning)

#### 3. Train the Machine Learning Model

```bash
python heart_model.py
```

This will:
- Generate 1500 synthetic health records
- Train a logistic regression model
- Evaluate model performance (accuracy ~68%)
- Export weights to `model_weights.json`

Expected output:
```
============================================================
GuardianHealth - Heart Attack Risk Prediction Model Training
============================================================

[1/4] Generating synthetic health dataset...
✓ Generated 1500 health records
...
Model Accuracy: 0.6800 (68.00%)
============================================================
```

#### 4. Start the Flask Backend Server

```bash
python backend.py
```

The server will start on `http://localhost:5000`

Expected output:
```
============================================================
GuardianHealth Backend API Server
============================================================
✓ Model weights loaded successfully
  - Model type: logistic_regression
  - Accuracy: 68.00%
============================================================
Starting Flask server...
API running at: http://localhost:5000
============================================================
```

#### 5. Open the Frontend Application

Open `index.html` in your web browser:

**Option A: Direct file access**
```
file:///path/to/your/project/index.html
```

**Option B: Using a local server (recommended)**
```bash
# Using Python's built-in server
python -m http.server 8000

# Then open: http://localhost:8000
```

**Option C: Using VS Code Live Server**
- Install "Live Server" extension
- Right-click on `index.html` → "Open with Live Server"

---

## 📖 How to Use GuardianHealth

### 1. Health Risk Assessment

1. **Enter Health Parameters:**
   - Age (40-120 years)
   - Systolic Blood Pressure (50-250 mmHg)
   - Diastolic Blood Pressure (30-150 mmHg)
   - Heart Rate (30-200 bpm)

2. **Click "Check Health Risk"**

3. **View Results:**
   - Risk Level: Low, Medium, or High
   - Probability percentages for each risk level
   - Color-coded indicators
   - Safety alerts if critical conditions detected

### 2. Emergency Features

**Emergency Alert**
- Click "🚨 EMERGENCY ALERT" to activate emergency protocols
- Triggers voice alerts and emergency modal

**Share Location**
- Click "📍 Share My Location"
- Uses Web Share API to send Google Maps link
- Fallback: Copies link to clipboard

**Call Emergency Contacts**
- Click "📞 Call Emergency Contact"
- Shows saved contacts with direct call buttons
- Add contacts in the Emergency Contacts section

**Find Nearby Hospitals**
- Click "🏥 Find Nearby Hospitals"
- Searches within 5km radius using Overpass API
- Displays hospitals on map with markers
- Shows distance and call buttons

### 3. Location Tracking

1. Click "📍 Get My Location"
2. Allow location access when browser prompts
3. View your coordinates and accuracy
4. See your location on the interactive map

### 4. Emergency Contacts Management

1. Enter contact name (e.g., "Son - John")
2. Enter phone number (e.g., "+1234567890")
3. Click "➕ Add Contact"
4. Saved contacts appear with call and delete buttons

### 5. Health Trends

- Automatic chart updates with each assessment
- Shows trends for:
  - Systolic Blood Pressure (red line)
  - Diastolic Blood Pressure (orange line)
  - Heart Rate (blue line)
- Displays last 10 assessments chronologically

### 6. Theme Toggle

- Click the moon (🌙) icon to switch to dark mode
- Click the sun (☀️) icon to switch to light mode
- Preference saved automatically

---

## 🧠 Machine Learning Model Details

### Dataset

- **Size:** 1500 synthetic health records
- **Features:**
  - Age (40-90 years)
  - Systolic BP (90-200 mmHg)
  - Diastolic BP (60-120 mmHg)
  - Heart Rate (40-130 bpm)
- **Target:** Risk level (0=Low, 1=Medium, 2=High)

### Model Architecture

- **Algorithm:** Logistic Regression (Multinomial)
- **Preprocessing:** StandardScaler normalization
- **Training Split:** 80% train, 20% test
- **Solver:** LBFGS (Limited-memory BFGS)

### Risk Calculation

The model calculates risk based on:

1. **Age Factor:**
   - >75 years: High risk
   - 65-75 years: Moderate risk
   - <65 years: Lower risk

2. **Blood Pressure:**
   - ≥180/110: Hypertensive crisis (High risk)
   - ≥160/100: Stage 2 hypertension (High risk)
   - ≥140/90: Stage 1 hypertension (Medium risk)
   - ≥130/80: Elevated (Low-Medium risk)

3. **Heart Rate:**
   - ≥120 or ≤45 bpm: Dangerous (High risk)
   - ≥100 or ≤50 bpm: Concerning (Medium risk)
   - 90-100 or 55-60 bpm: Elevated (Low risk)

### Safety Rules (Override Model)

The system includes rule-based overrides that trigger High risk regardless of model prediction:

- Systolic BP ≥ 180 mmHg
- Diastolic BP ≥ 110 mmHg
- Heart Rate ≥ 120 bpm
- Heart Rate ≤ 45 bpm
- Combined: High BP + Abnormal HR
- Elderly (≥75) with elevated vitals

### Model Performance

```
Accuracy: ~68%

Classification Report:
              precision    recall  f1-score
Low Risk         0.73      0.56      0.63
Medium Risk      0.60      0.64      0.62
High Risk        0.74      0.74      0.74
```

---

## 🎙️ Voice Assistant System

### Voice Alerts

**Trigger Conditions:**
- High risk detected automatically
- Emergency alert button pressed

**Alert Messages:**
- "Warning: High risk detected. Please seek medical help immediately."

### Intelligent Voice Assistant

**Continuous Monitoring:**
- Activates automatically for High risk
- Repeats supportive messages every 20 seconds
- Designed for potentially unconscious users

**Supportive Messages:**
- "Stay calm. Help is on the way. Try to remain conscious."
- "Please breathe slowly. Assistance will arrive soon."
- "You are not alone. Emergency services have been notified."
- "Try to stay awake. Help is coming."
- "Breathe deeply and slowly. Medical help is on the way."
- "Stay still and remain calm. You will be okay."

**Browser Compatibility:**
- Uses Web Speech API (SpeechSynthesis)
- Supported on: Chrome, Edge, Safari, Firefox
- Rate: 0.9 (slightly slower for clarity)
- Volume: Maximum (1.0)

---

## 🗺️ Location & Maps Integration

### Technologies Used

- **Geolocation API:** Browser's built-in GPS access
- **Leaflet.js:** Open-source interactive maps
- **OpenStreetMap:** Free map tiles
- **Overpass API:** Query nearby hospitals/clinics

### Features

1. **Accurate Location:**
   - High accuracy mode enabled
   - Shows latitude, longitude, accuracy radius
   - Updates in real-time

2. **Interactive Map:**
   - Zoom and pan controls
   - User location marked with blue dot
   - Hospital locations marked with red "H"

3. **Hospital Search:**
   - 5km search radius
   - Finds hospitals and clinics
   - Calculates distances using Haversine formula
   - Displays up to 10 closest facilities

4. **Location Sharing:**
   - Generates Google Maps link
   - Web Share API for mobile sharing
   - Clipboard fallback for desktop
   - Format: `https://www.google.com/maps?q=lat,lng`

---

## 💾 Data Storage

### LocalStorage Keys

All data stored client-side for privacy:

1. **guardianhealth_history**
   - Stores last 50 health assessments
   - Includes: date, risk level, vitals, probabilities

2. **guardianhealth_contacts**
   - Emergency contact list
   - Includes: name, phone, unique ID

3. **guardianhealth_theme**
   - User's theme preference (light/dark)

### Data Structure Examples

**Health History Entry:**
```json
{
  "date": "2026-03-31T13:48:52.772Z",
  "risk_level": "Medium",
  "input": {
    "age": 65,
    "systolic_bp": 140,
    "diastolic_bp": 90,
    "heart_rate": 85
  },
  "probability": 0.54,
  "probabilities": {
    "Low": 0.25,
    "Medium": 0.54,
    "High": 0.21
  },
  "id": 1711893532772
}
```

**Emergency Contact:**
```json
{
  "name": "Son - John",
  "phone": "+1234567890",
  "id": 1711893532772
}
```

---

## 📱 Progressive Web App (PWA)

### Installation

**On Android (Chrome):**
1. Open the app in Chrome
2. Look for "Install app" banner
3. Or: Menu → "Add to Home screen"
4. App appears on home screen like native app

**On iOS (Safari):**
1. Open the app in Safari
2. Tap Share button
3. Scroll down → "Add to Home Screen"
4. Enter name → Add

**On Desktop (Chrome/Edge):**
1. Look for install icon in address bar
2. Or: Menu → "Install GuardianHealth"
3. App opens in standalone window

### Offline Features

**Service Worker Caching:**
- HTML, CSS, JavaScript files
- External libraries (Leaflet, Chart.js)
- Offline functionality for core features

**What Works Offline:**
- Health risk prediction (if backend was cached)
- Health history viewing
- Emergency contacts management
- Theme switching
- Chart viewing

**What Requires Internet:**
- Backend API predictions (first time)
- Live location tracking
- Hospital search
- Map tiles loading
- Location sharing

### PWA Manifest Details

```json
{
  "name": "GuardianHealth - Elderly Health Monitor",
  "short_name": "GuardianHealth",
  "display": "standalone",
  "theme_color": "#3498db",
  "background_color": "#2c3e50",
  "orientation": "portrait-primary"
}
```

---

## 📲 Convert to Native Mobile App

### Option 1: Using Capacitor (Recommended)

**Install Capacitor:**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init GuardianHealth com.guardianhealth.app
```

**Add Platforms:**
```bash
# Android
npm install @capacitor/android
npx cap add android

# iOS (macOS only)
npm install @capacitor/ios
npx cap add ios
```

**Build:**
```bash
# Copy web assets
npx cap copy

# Open in IDE
npx cap open android  # Opens Android Studio
npx cap open ios      # Opens Xcode
```

### Option 2: Using Cordova

**Install Cordova:**
```bash
npm install -g cordova
cordova create GuardianHealth com.guardianhealth.app GuardianHealth
```

**Add Platforms:**
```bash
cd GuardianHealth
cordova platform add android
cordova platform add ios
```

**Build:**
```bash
cordova build android
cordova build ios
```

### Required Permissions

Add to your mobile app config:

**Android (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.INTERNET" />
```

**iOS (Info.plist):**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>GuardianHealth needs your location for emergency services</string>
<key>NSMicrophoneUsageDescription</key>
<string>GuardianHealth uses voice for emergency alerts</string>
```

---

## 🚀 Deployment Options

### Option 1: GitHub Pages (Frontend Only)

```bash
# Create gh-pages branch
git checkout -b gh-pages

# Push to GitHub
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

Access at: `https://username.github.io/repository/`

**Note:** Backend must be hosted separately (see below)

### Option 2: Netlify (Frontend)

1. Create account at netlify.com
2. Drag and drop project folder
3. Or connect GitHub repository
4. Auto-deploys on every commit

**Update API URL in script.js:**
```javascript
const API_URL = 'https://your-backend.herokuapp.com/predict';
```

### Option 3: Vercel (Frontend)

```bash
npm install -g vercel
vercel
```

### Option 4: Heroku (Full Stack)

**Create Procfile:**
```
web: python backend.py
```

**Deploy:**
```bash
heroku create guardianhealth
git push heroku main
```

### Option 5: Railway (Full Stack)

1. Connect GitHub repository at railway.app
2. Auto-detects Python app
3. Adds environment variables
4. Deploys automatically

### Option 6: PythonAnywhere (Backend)

1. Upload files to pythonanywhere.com
2. Create Flask web app
3. Configure WSGI file
4. Update CORS settings for your frontend domain

---

## 🔧 API Documentation

### Backend Endpoints

#### 1. GET `/`
**Description:** API information

**Response:**
```json
{
  "service": "GuardianHealth API",
  "version": "1.0.0",
  "status": "active",
  "endpoints": {
    "/predict": "POST - Predict heart attack risk",
    "/health": "GET - Check API health"
  }
}
```

#### 2. GET `/health`
**Description:** Health check

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

#### 3. POST `/predict`
**Description:** Predict heart attack risk

**Request Body:**
```json
{
  "age": 65,
  "systolic_bp": 140,
  "diastolic_bp": 90,
  "heart_rate": 85
}
```

**Response:**
```json
{
  "risk_level": "Medium",
  "probability": 0.54,
  "probabilities": {
    "Low": 0.25,
    "Medium": 0.54,
    "High": 0.21
  },
  "override_applied": false,
  "override_reason": null,
  "input": {
    "age": 65,
    "systolic_bp": 140,
    "diastolic_bp": 90,
    "heart_rate": 85
  }
}
```

**Error Response:**
```json
{
  "error": "Missing required field: age"
}
```

---

## 🛠️ Troubleshooting

### Backend Issues

**Problem:** `Model weights not loaded`
**Solution:** Run `python heart_model.py` first to generate `model_weights.json`

**Problem:** `CORS error` in browser console
**Solution:** Make sure Flask-CORS is installed: `pip install flask-cors`

**Problem:** `Connection refused to localhost:5000`
**Solution:** Ensure backend is running: `python backend.py`

### Frontend Issues

**Problem:** Location not working
**Solution:**
- Use HTTPS or localhost (required for Geolocation API)
- Allow location permission in browser
- Check browser's location settings

**Problem:** Voice alerts not working
**Solution:**
- Web Speech API requires HTTPS (except localhost)
- Check browser support (works in Chrome, Edge, Safari)
- Ensure volume is not muted

**Problem:** Hospital search returns no results
**Solution:**
- Check internet connection
- Overpass API may be rate-limited
- Try again after a few seconds

**Problem:** PWA install button not showing
**Solution:**
- Must be served over HTTPS (except localhost)
- Manifest and service worker must load successfully
- Some browsers don't show install prompt

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core App | ✅ | ✅ | ✅ | ✅ |
| Geolocation | ✅ | ✅ | ✅ | ✅ |
| Voice Synthesis | ✅ | ✅ | ✅ | ✅ |
| Web Share API | ✅ (Android) | ❌ | ✅ (iOS) | ✅ |
| PWA Install | ✅ | ⚠️ Limited | ✅ (iOS 11.3+) | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |

---

## 🔐 Security & Privacy

### Data Privacy

- **All data stored locally** in browser's LocalStorage
- No data sent to external servers except:
  - Health data to YOUR backend API
  - Location queries to Overpass API (anonymous)
  - Map tiles from OpenStreetMap
- No user accounts or authentication required
- No tracking or analytics

### Security Best Practices

1. **HTTPS Required for Production:**
   - Geolocation API requires HTTPS
   - Service Worker requires HTTPS
   - Web Share API requires HTTPS

2. **Input Validation:**
   - All inputs validated on frontend
   - Backend validates ranges
   - SQL injection not applicable (no database)

3. **CORS Configuration:**
   - Backend restricts origins in production
   - Update Flask-CORS settings for your domain

4. **Sensitive Data:**
   - No passwords stored
   - Phone numbers stored locally only
   - Clear browser data to remove all information

---

## 📊 Performance Optimization

### Frontend Optimizations

- Debounced event handlers
- Lazy loading for maps and charts
- Efficient LocalStorage queries
- Minimal DOM manipulations
- CSS transitions instead of JavaScript animations

### Backend Optimizations

- Lightweight Flask server
- Fast NumPy computations
- Cached model weights (loaded once)
- No database queries
- CORS pre-flight caching

### Bundle Size

- HTML: ~10 KB
- CSS: ~15 KB
- JavaScript: ~25 KB
- Total (uncompressed): ~50 KB
- External libraries (CDN): ~200 KB

---

## 🧪 Testing

### Manual Testing Checklist

**Health Prediction:**
- [ ] Enter valid vitals → Check prediction accuracy
- [ ] Enter high BP (>180) → Should trigger High risk
- [ ] Enter low HR (<45) → Should trigger High risk
- [ ] View probability bars → Should sum to 100%
- [ ] Check history → New entry added

**Emergency Features:**
- [ ] Click Emergency Alert → Modal appears, voice plays
- [ ] Click Share Location → Location shared/copied
- [ ] Add emergency contact → Appears in list
- [ ] Click Call button → Phone dialer opens

**Location & Maps:**
- [ ] Get Location → Coordinates displayed
- [ ] Map loads → Shows user marker
- [ ] Find Hospitals → Markers appear on map
- [ ] Hospital list → Shows with distances

**UI/UX:**
- [ ] Toggle theme → Colors change
- [ ] Responsive design → Works on mobile
- [ ] Animations → Smooth transitions
- [ ] Accessibility → Keyboard navigation works

### Automated Testing (Future)

```bash
# Install testing dependencies
pip install pytest pytest-flask

# Run tests
pytest tests/
```

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Reporting Issues

1. Check existing issues first
2. Use issue templates
3. Provide detailed reproduction steps
4. Include screenshots/videos if applicable

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Create a Pull Request

### Code Style

- **Python:** Follow PEP 8
- **JavaScript:** Use semicolons, 2-space indentation
- **HTML/CSS:** Semantic markup, BEM naming
- **Comments:** Document complex logic

---

## 📝 License

This project is released under the MIT License.

```
MIT License

Copyright (c) 2026 Swamy K R

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## ⚠️ Medical Disclaimer

**IMPORTANT:** GuardianHealth is a **health assistance tool** and **NOT a medical device**.

- **Not a substitute** for professional medical advice
- **Not FDA approved** or medically validated
- Predictions are based on ML model (68% accuracy)
- **Always consult** healthcare professionals for medical decisions
- In real emergencies, **call 911** or local emergency services
- The voice assistant is for **guidance only**, not treatment

**Use at your own risk.** The developers assume no liability for medical decisions made using this application.

---

## 👨‍💻 Author

**Swamy K R**
- GitHub: [@Swamy-kr17](https://github.com/Swamy-kr17)
- Project: GuardianHealth v1.0.0

---

## 🙏 Acknowledgments

### Technologies Used

- **Python Libraries:** NumPy, Pandas, Scikit-learn, Flask
- **JavaScript Libraries:** Leaflet.js, Chart.js
- **APIs:** OpenStreetMap, Overpass API, Web APIs
- **Icons:** Emoji (cross-platform compatible)

### Resources

- OpenStreetMap contributors
- Web Speech API documentation
- PWA best practices
- Medical guidelines (WHO, AHA)

---

## 🔮 Future Enhancements

### Planned Features

- [ ] User authentication and cloud sync
- [ ] Multiple user profiles (family support)
- [ ] Medication reminders
- [ ] Appointment scheduling
- [ ] Integration with wearables (Fitbit, Apple Watch)
- [ ] Video call with doctors
- [ ] Multilingual support
- [ ] PDF health report export
- [ ] Historical trend analysis with AI insights
- [ ] Fall detection (using accelerometer)
- [ ] Blood oxygen monitoring
- [ ] Glucose level tracking
- [ ] Push notifications for medication

### Research Improvements

- [ ] Improve model accuracy (target: 80%+)
- [ ] Use real patient data (with privacy compliance)
- [ ] Deep learning models (neural networks)
- [ ] Real-time vitals monitoring via sensors
- [ ] Predictive analytics for long-term health

---

## 📞 Support

Need help? Have questions?

1. **Documentation:** Read this README thoroughly
2. **Issues:** Open an issue on GitHub
3. **Discussions:** Join GitHub Discussions
4. **Email:** Contact through GitHub profile

---

## ⭐ Show Your Support

If GuardianHealth helps you or your loved ones, please:

- ⭐ Star this repository
- 🍴 Fork and contribute
- 📢 Share with others who might benefit
- 💬 Provide feedback

---

**Thank you for using GuardianHealth! Stay healthy and safe! ❤️**

---

*Last Updated: March 31, 2026*
*Version: 1.0.0*
*Status: Production Ready*
