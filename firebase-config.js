// Firebase Configuration
// TravelPlan Firebase Project

const firebaseConfig = {
    apiKey: "AIzaSyC_cn12bLMHbp4MDZ_TKYb02ImUiIvRM5w",
    authDomain: "travelplan-gt.firebaseapp.com",
    projectId: "travelplan-gt",
    storageBucket: "travelplan-gt.firebasestorage.app",
    messagingSenderId: "421475752704",
    appId: "1:421475752704:web:cededc9a5a330048e3b1e5",
    measurementId: "G-H8D8FJ6ESY"
};

// Initialize Firebase
let app, auth, db;

function initializeFirebase() {
    try {
        // Initialize Firebase App
        app = firebase.initializeApp(firebaseConfig);

        // Initialize Firebase Authentication
        auth = firebase.auth();

        // Initialize Firestore with offline persistence
        db = firebase.firestore();

        // Enable offline persistence
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.log('✓ Firestore offline persistence enabled');
            })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence enabled in first tab only');
                } else if (err.code === 'unimplemented') {
                    console.warn('Browser doesn\'t support offline persistence');
                }
            });

        console.log('✓ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('✗ Firebase initialization error:', error);
        return false;
    }
}

// Export for use in other files
window.firebaseApp = {
    config: firebaseConfig,
    app: () => app,
    auth: () => auth,
    db: () => db,
    initialize: initializeFirebase
};

// Note: This file will be loaded before app.js
// Firebase will be initialized when the app starts
