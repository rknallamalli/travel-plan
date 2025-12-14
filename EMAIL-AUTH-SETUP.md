# TravelPlan v1.1 - Email/Password Only Setup

## ✅ COMPLETED

1. ✅ Removed Google Sign-In button from UI
2. ✅ Simplified to Email/Password only
3. ✅ All Firebase modules ready

---

## 🔧 FIREBASE SETUP REQUIRED

### Step 1: Enable Email/Password Authentication

1. Go to: https://console.firebase.google.com/
2. Select project: **travelplan-gt**
3. Click: **Authentication** → **Sign-in method** tab
4. Find **"Email/Password"**
5. Click on it
6. Toggle **"Enable"** to ON
7. Click **"Save"**

### Step 2: Update Firestore Rules

1. Still in Firebase Console
2. Click: **Firestore Database** → **Rules** tab
3. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own trips
    match /trips/{tripId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to manage invites
    match /invites/{inviteId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

---

## 🧪 TESTING

### Test Locally (Live Server):

1. Make sure Live Server is running: http://127.0.0.1:5500/

2. Click **"Sign In"**

3. Click **"Sign Up"** tab

4. Create account:
   - Name: Your Name
   - Email: your@email.com
   - Password: (at least 6 characters)
   - Confirm Password: (same)

5. Click **"Create Account"**

6. Should sign in automatically!

7. Try creating a trip

8. Check Firebase Console → Firestore Database
   - Should see your trip!

---

## 📤 DEPLOY TO GITHUB

Once tested locally:

1. Upload these files to GitHub:
   - `index.html` (Google button removed)
   - `app.js` (has Firebase sync methods)
   - `firebase-db.js` (fixed)
   - `firebase-integration.js`
   - All other Firebase files

2. Wait 30 seconds

3. Test at: https://rknallamalli.github.io/travel-plan/

4. Sign up with your email

5. Start planning your trip!

---

## ✨ FEATURES

- ✅ Email/Password authentication
- ✅ Cloud sync with Firestore
- ✅ Real-time updates
- ✅ Offline support
- ✅ Works on localhost and GitHub Pages
- ✅ No OAuth domain issues!

---

## 🎯 NEXT STEPS

1. Enable Email/Password in Firebase Console
2. Update Firestore rules
3. Test locally with Live Server
4. Upload to GitHub
5. Test on GitHub Pages
6. Use for your trip! 🎉
