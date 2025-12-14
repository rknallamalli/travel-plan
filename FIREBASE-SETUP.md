# Firebase Setup Guide for TravelPlan v1.1

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project"
   - Project name: `TravelPlan` (or your preferred name)
   - Click "Continue"

3. **Google Analytics** (Optional)
   - You can disable this for now
   - Click "Create project"
   - Wait for project creation (~30 seconds)

4. **Click "Continue"** when ready

## Step 2: Register Web App

1. **In Firebase Console**
   - Click the **Web icon** (</>) to add a web app
   - App nickname: `TravelPlan Web`
   - ✅ Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

2. **Copy Firebase Config**
   - You'll see a code snippet like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "travelplan-xxxxx.firebaseapp.com",
     projectId: "travelplan-xxxxx",
     storageBucket: "travelplan-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
   - **SAVE THIS** - You'll need it!
   - Click "Continue to console"

## Step 3: Enable Authentication

1. **In Firebase Console**
   - Click "Authentication" in left sidebar
   - Click "Get started"

2. **Enable Sign-in Methods**
   - Click "Sign-in method" tab
   - Enable **Google**:
     - Click "Google"
     - Toggle "Enable"
     - Project support email: (your email)
     - Click "Save"
   
   - Enable **Email/Password**:
     - Click "Email/Password"
     - Toggle "Enable"
     - Click "Save"

## Step 4: Set Up Firestore Database

1. **In Firebase Console**
   - Click "Firestore Database" in left sidebar
   - Click "Create database"

2. **Security Rules**
   - Select "Start in **test mode**" (we'll add proper rules later)
   - Click "Next"

3. **Location**
   - Choose closest region (e.g., "us-central" for USA)
   - Click "Enable"
   - Wait for database creation (~1 minute)

## Step 5: Configure Security Rules

1. **In Firestore Database**
   - Click "Rules" tab
   - Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trips - owner and shared users can access
    match /trips/{tripId} {
      allow read: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.sharedWith);
      
      allow create: if request.auth != null && 
        request.resource.data.ownerId == request.auth.uid;
      
      allow update, delete: if request.auth != null && 
        resource.data.ownerId == request.auth.uid;
    }
    
    // Shared trip invites
    match /invites/{inviteId} {
      allow read: if request.auth != null && 
        (resource.data.fromUserId == request.auth.uid || 
         resource.data.toEmail == request.auth.token.email);
      
      allow create: if request.auth != null;
      allow delete: if request.auth != null && 
        resource.data.fromUserId == request.auth.uid;
    }
  }
}
```

2. **Click "Publish"**

## Step 6: Get Your Firebase Config

Your Firebase config should look like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**IMPORTANT**: Save this config - you'll need to provide it to me!

## Step 7: Enable Offline Persistence

This is handled in code, but good to know:
- Firestore has built-in offline support
- Data syncs automatically when online
- Perfect for travel apps!

## Next Steps

Once you have your Firebase config:
1. Provide me the config values
2. I'll integrate Firebase into TravelPlan
3. We'll test authentication
4. We'll test real-time sync
5. We'll test sharing features

---

## Estimated Time

- Firebase setup: 10-15 minutes
- Providing config to me: 2 minutes
- My implementation: 3-4 hours
- Testing together: 30 minutes

**Total: ~4-5 hours to fully working collaboration!**

---

## Security Notes

- ✅ Your API key is safe to expose (it's client-side)
- ✅ Security is enforced by Firestore rules
- ✅ Only authenticated users can access data
- ✅ Users can only see their own trips + shared trips
- ✅ Trip data is private by default

---

**Ready to start? Complete the Firebase setup and share your config with me!**
