# TravelPlan v1.1 - Debugging Guide

## 🐛 Troubleshooting "New Trip Not Working"

### Step 1: Check Browser Console

1. Open https://rknallamalli.github.io/travel-plan/
2. Press **F12** to open Developer Tools
3. Click **Console** tab
4. Try creating a trip
5. Look for errors (red text)

### Common Errors and Solutions:

#### Error 1: "Firebase is not defined"
**Solution:** Clear browser cache and reload
- Press Ctrl+Shift+R (hard reload)

#### Error 2: "updateSyncStatus is not defined"
**Solution:** This is expected, just a warning. Trip should still work.

#### Error 3: "Missing or insufficient permissions"
**Solution:** Firestore rules issue
- Go to Firebase Console
- Firestore Database → Rules
- Make sure rules allow write access

#### Error 4: "User must be signed in"
**Solution:** Sign in again
- Click Sign Out
- Sign in with Google again

#### Error 5: Nothing happens when clicking "Create Trip"
**Solution:** Form validation issue
- Make sure all required fields are filled
- Check start date is before end date

### Step 2: Check Firestore Rules

Go to: https://console.firebase.google.com/
1. Select project: travelplan-gt
2. Click Firestore Database
3. Click Rules tab
4. Make sure you have these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

### Step 3: Test Firestore Directly

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `test`
4. Document ID: (auto)
5. Field: `name`, Value: `test`
6. Click Save

If this works, Firestore is working!

### Step 4: Check if Firebase is Initialized

In browser console, type:
```javascript
window.firebaseApp
window.firebaseAuth
window.firebaseDB
```

All three should show objects, not `undefined`.

### Step 5: Check if User is Signed In

In browser console, type:
```javascript
window.firebaseAuth.getCurrentUser()
```

Should show your user object with email.

### Step 6: Manual Test

In browser console, try creating a trip manually:
```javascript
window.firebaseDB.createTrip({
  name: "Test Trip",
  destination: "Test City",
  startDate: "2025-12-20",
  endDate: "2025-12-25",
  budget: 1000,
  description: "Test",
  days: [],
  expenses: [],
  notes: ""
}).then(result => console.log(result));
```

Check the result - should show `{success: true, ...}`

---

## 🎯 Most Likely Issues:

1. **Firestore Rules** - Not allowing writes
2. **User not signed in** - Auth state lost
3. **Browser cache** - Old code cached
4. **Firebase not initialized** - Scripts not loaded

---

## 📝 What to Share with Me:

Please copy and paste:
1. Any RED errors from console
2. Result of: `window.firebaseAuth.getCurrentUser()`
3. Result of: `window.firebaseDB`
4. What happens when you click "New Trip" button

This will help me identify the exact issue!
