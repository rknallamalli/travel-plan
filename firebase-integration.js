// TravelPlan v1.1 - Firebase Integration Code
// This file contains the integration logic to connect Firebase with the existing app

// ===================================
// AUTHENTICATION FUNCTIONS
// ===================================

function showAuthModal() {
    document.getElementById('auth-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function switchAuthTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.remove('active');
        if (t.dataset.tab === tab) {
            t.classList.add('active');
        }
    });

    // Update forms
    if (tab === 'signin') {
        document.getElementById('signin-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    } else {
        document.getElementById('signin-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    }
}

async function signInWithGoogle() {
    const result = await window.firebaseAuth.signInWithGoogle();
    if (result.success) {
        closeModal('auth-modal');
        app.showNotification('Signed in successfully!');
    } else {
        alert('Sign in failed: ' + result.error);
    }
}

async function handleSignIn(event) {
    event.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    const result = await window.firebaseAuth.signInWithEmail(email, password);
    if (result.success) {
        // Close modal directly
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (window.app) app.showNotification('Signed in successfully!');
    } else {
        alert('Sign in failed: ' + result.error);
    }
}

async function handleSignUp(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const result = await window.firebaseAuth.signUpWithEmail(email, password, name);
    if (result.success) {
        // Close modal directly
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (window.app) app.showNotification('Account created successfully!');
    } else {
        alert('Sign up failed: ' + result.error);
    }
}

async function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        const result = await window.firebaseAuth.signOut();
        if (result.success) {
            app.showNotification('Signed out successfully');
            // Reload to reset app state
            location.reload();
        }
    }
}

function showPasswordReset() {
    const email = prompt('Enter your email address:');
    if (email) {
        window.firebaseAuth.sendPasswordResetEmail(email).then(result => {
            if (result.success) {
                alert('Password reset email sent! Check your inbox.');
            } else {
                alert('Error: ' + result.error);
            }
        });
    }
}

function showUserProfile() {
    alert('User profile feature coming soon!');
}

function showInvites() {
    alert('Invites feature coming soon!');
}

// ===================================
// UI UPDATE FUNCTIONS
// ===================================

function updateUIForAuthState(user) {
    const userMenu = document.getElementById('user-menu');
    const signInBtn = document.getElementById('sign-in-btn');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (user) {
        // User is signed in
        userMenu.style.display = 'flex';
        signInBtn.style.display = 'none';

        // Update user info
        userName.textContent = user.displayName || user.email.split('@')[0];
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
            userAvatar.style.display = 'block';
        }
    } else {
        // User is signed out
        userMenu.style.display = 'none';
        signInBtn.style.display = 'block';
    }
}

function updateSyncStatus(status) {
    const syncStatus = document.getElementById('sync-status');
    if (!syncStatus) return;

    syncStatus.className = '';

    switch (status) {
        case 'synced':
            syncStatus.innerHTML = '● Synced';
            syncStatus.style.color = 'var(--color-success)';
            break;
        case 'syncing':
            syncStatus.innerHTML = '<span class="spinner"></span> Syncing...';
            syncStatus.classList.add('syncing');
            break;
        case 'offline':
            syncStatus.innerHTML = '○ Offline';
            syncStatus.classList.add('offline');
            break;
    }
}

// ===================================
// USER DROPDOWN TOGGLE
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    const userButton = document.getElementById('user-button');
    const userDropdown = document.getElementById('user-dropdown-menu');

    if (userButton && userDropdown) {
        userButton.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
    }
});

// ===================================
// FIREBASE INITIALIZATION
// ===================================

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.firebaseApp) {
        // Initialize Firebase
        window.firebaseApp.initialize();
        window.firebaseAuth.initialize();
        window.firebaseDB.initialize();
        window.firebaseSharing.initialize();

        // Set up auth state observer
        window.firebaseAuth.onAuthStateChanged((user) => {
            updateUIForAuthState(user);

            if (user && app) {
                // User signed in - switch to Firestore
                app.enableFirebaseSync();
            } else if (app) {
                // User signed out - use LocalStorage
                app.disableFirebaseSync();
            }
        });
    }
});
