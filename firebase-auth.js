// Firebase Authentication Module
// Handles user sign-in, sign-up, and session management

class FirebaseAuth {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.onAuthStateChangedCallback = null;
    }

    initialize() {
        this.auth = window.firebaseApp.auth();
        this.setupAuthStateListener();
    }

    // Set up authentication state observer
    setupAuthStateListener() {
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;

            if (user) {
                console.log('✓ User signed in:', user.email);
                // Skip profile update for now to avoid permissions error
                // this.updateUserProfile(user);
            } else {
                console.log('○ User signed out');
            }

            // Notify app of auth state change
            if (this.onAuthStateChangedCallback) {
                this.onAuthStateChangedCallback(user);
            }
        });
    }

    // Register auth state change callback
    onAuthStateChanged(callback) {
        this.onAuthStateChangedCallback = callback;
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);

            console.log('✓ Google sign-in successful');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('✗ Google sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            const result = await this.auth.signInWithEmailAndPassword(email, password);

            console.log('✓ Email sign-in successful');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('✗ Email sign-in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign up with email and password
    async signUpWithEmail(email, password, displayName) {
        try {
            const result = await this.auth.createUserWithEmailAndPassword(email, password);

            // Update profile with display name
            if (displayName) {
                await result.user.updateProfile({ displayName });
            }

            console.log('✓ Email sign-up successful');
            return { success: true, user: result.user };
        } catch (error) {
            console.error('✗ Email sign-up error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut() {
        try {
            await this.auth.signOut();
            console.log('✓ Sign out successful');
            return { success: true };
        } catch (error) {
            console.error('✗ Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user profile in Firestore
    async updateUserProfile(user) {
        try {
            const db = window.firebaseApp.db();
            const userRef = db.collection('users').doc(user.uid);

            await userRef.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || null,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log('✓ User profile updated');
        } catch (error) {
            console.error('✗ Error updating user profile:', error);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is signed in
    isSignedIn() {
        return this.currentUser !== null || (this.auth && this.auth.currentUser !== null);
    }

    // Get user display name
    getUserDisplayName() {
        if (!this.currentUser) return 'Guest';
        return this.currentUser.displayName || this.currentUser.email.split('@')[0];
    }

    // Get user email
    getUserEmail() {
        return this.currentUser ? this.currentUser.email : null;
    }

    // Get user ID
    getUserId() {
        return this.currentUser ? this.currentUser.uid : null;
    }

    // Send password reset email
    async sendPasswordResetEmail(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            console.log('✓ Password reset email sent');
            return { success: true };
        } catch (error) {
            console.error('✗ Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user password
    async updatePassword(newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('No user signed in');
            }

            await this.currentUser.updatePassword(newPassword);
            console.log('✓ Password updated');
            return { success: true };
        } catch (error) {
            console.error('✗ Password update error:', error);
            return { success: false, error: error.message };
        }
    }

    // Update user profile (display name, photo)
    async updateProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('No user signed in');
            }

            await this.currentUser.updateProfile(updates);
            await this.updateUserProfile(this.currentUser);

            console.log('✓ Profile updated');
            return { success: true };
        } catch (error) {
            console.error('✗ Profile update error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create global instance
window.firebaseAuth = new FirebaseAuth();
