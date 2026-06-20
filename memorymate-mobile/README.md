# MemoryMate Mobile App

React Native (Expo) app for patients and caregivers.

## Quick Start

### 1. Install dependencies
```bash
cd memorymate-mobile
npm install
```

### 2. Update the API URL
Open `src/services/api.js` and change `BASE_URL` to your backend:
- **Android emulator**: `http://10.0.2.2:3000`
- **Physical device (same WiFi)**: `http://192.168.x.x:3000` (your machine's local IP)
- **Deployed backend**: `https://your-render-app.onrender.com`

### 3. Start Expo
```bash
npx expo start
```
Scan the QR code with **Expo Go** app (Android/iOS).

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Patient | patient@demo.com | password123 |
| Caregiver | caregiver@demo.com | password123 |

Patient's invite code: **DEMO01**

## App Structure

```
memorymate-mobile/
├── App.js                         ← Root with context providers
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.js        ← Root navigator (auth vs. logged-in)
│   │   ├── PatientNavigator.js    ← Patient bottom tabs
│   │   └── CaregiverNavigator.js  ← Caregiver bottom tabs
│   ├── screens/
│   │   ├── auth/                  ← Login, Register
│   │   ├── patient/               ← Home, FaceRecognition, Reminders, SafeZoneStatus
│   │   └── caregiver/             ← Dashboard, ManageFaces, ManageRoutines, SafeZoneEditor, ActivityLog
│   ├── components/                ← BigButton, Card, ReminderItem, FaceCard, AlertBanner, LoadingSpinner
│   ├── context/                   ← AuthContext, AppContext
│   ├── services/                  ← api.js, locationService.js, notificationService.js
│   ├── ml/                        ← faceRecognition.js (Phase 1 stub, Phase 4 TFLite)
│   └── utils/                     ← theme.js, helpers.js
```

## Roles
- **PATIENT**: Sees simplified dark UI — large clock, recognize faces, reminders, safe zone status
- **CAREGIVER**: Sees dashboard — manage faces, routines, safe zones, view activity log

## Phase 4 — On-device Face Recognition
In `src/ml/faceRecognition.js`, the `loadFaceModel()` and `computeEmbedding()` stubs will be replaced with actual TFLite integration once the backend backend matching is validated.
