// Trip Sharing Feature
// Adds share code functionality to existing trips

// Generate a random 6-character share code
function generateShareCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Show share modal with code
async function showShareModal() {
    if (!window.app || !window.app.currentTrip) return;

    const trip = window.app.currentTrip;

    // Generate share code if doesn't exist
    if (!trip.shareCode) {
        trip.shareCode = generateShareCode();
    }

    // Check if we can sync to Firestore
    // Don't rely on app.useFirestore flag, check connection directly
    // This fixes the issue where app might be in local-only mode despite being signed in
    const isConnected = window.firebaseAuth && window.firebaseAuth.isSignedIn() && window.firebaseDB;

    if (isConnected) {
        console.log('Syncing trip and share code to Firestore:', trip.shareCode);
        const db = window.firebaseApp.db();

        try {
            // Use set with merge: true to ensure document exists
            // This force-creates the document if it was only local before
            await db.collection('trips').doc(trip.id).set({
                ...trip,
                shareCode: trip.shareCode,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log('✓ Trip synced to Firestore with share code');

            // Also enable Firestore mode for the app if it wasn't
            if (window.app && !window.app.useFirestore) {
                console.log('Enabling Firestore mode for app');
                window.app.useFirestore = true;
            }
        } catch (error) {
            console.error('✗ Failed to sync trip to Firestore:', error);
            window.app.saveToStorage();
        }
    } else {
        console.warn('Cannot sync to Firestore: Not signed in');
        window.app.saveToStorage();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'share-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2>Share Trip</h2>
                <button class="modal-close" onclick="closeShareModal()">×</button>
            </div>
            <div class="modal-body" style="text-align: center; padding: 2rem;">
                <p style="margin-bottom: 1rem; color: var(--color-text-secondary);">
                    Share this code with your friends so they can join and edit this trip together!
                </p>
                
                <div style="background: var(--color-bg-tertiary); padding: 2rem; border-radius: var(--radius-lg); margin: 1.5rem 0;">
                    <div style="font-size: 0.875rem; color: var(--color-text-tertiary); margin-bottom: 0.5rem;">
                        Trip Code
                    </div>
                    <div style="font-size: 3rem; font-weight: 700; letter-spacing: 0.5rem; color: var(--color-primary); font-family: monospace;">
                        ${trip.shareCode}
                    </div>
                </div>
                
                <button class="btn btn-primary" onclick="copyShareCode('${trip.shareCode}')" style="width: 100%; margin-bottom: 1rem;">
                    📋 Copy Code
                </button>
                
                <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--color-border);">
                    <p style="font-size: 0.875rem; color: var(--color-text-tertiary); margin-bottom: 1rem;">
                        <strong>Collaborators (${(trip.collaborators || []).length})</strong>
                    </p>
                    <div id="collaborators-list" style="max-height: 150px; overflow-y: auto;">
                        ${(trip.collaborators || []).map(email => `
                            <div style="padding: 0.5rem; background: var(--color-bg-secondary); border-radius: var(--radius-md); margin-bottom: 0.5rem;">
                                ${email}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Close share modal
function closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Copy share code to clipboard
function copyShareCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        if (window.app) {
            window.app.showNotification('Code copied to clipboard!');
        } else {
            alert('Code copied: ' + code);
        }
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        if (window.app) {
            window.app.showNotification('Code copied to clipboard!');
        } else {
            alert('Code copied: ' + code);
        }
    });
}

// Show join trip modal
function showJoinTripModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'join-trip-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Join Trip</h2>
                <button class="modal-close" onclick="closeJoinTripModal()">×</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1.5rem; color: var(--color-text-secondary);">
                    Enter the 6-character code shared by your friend to join their trip.
                </p>
                
                <form onsubmit="joinTripByCode(event)">
                    <div class="form-group">
                        <label for="join-code">Trip Code</label>
                        <input 
                            type="text" 
                            id="join-code" 
                            class="form-control" 
                            placeholder="ABC123" 
                            maxlength="6"
                            style="text-transform: uppercase; letter-spacing: 0.3rem; font-size: 1.5rem; text-align: center; font-family: monospace;"
                            required
                        >
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        Join Trip
                    </button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Auto-uppercase input
    const input = document.getElementById('join-code');
    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });
}

// Close join trip modal
function closeJoinTripModal() {
    const modal = document.getElementById('join-trip-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Join trip by code
async function joinTripByCode(event) {
    event.preventDefault();

    const code = document.getElementById('join-code').value.toUpperCase().trim();

    if (!code || code.length !== 6) {
        alert('Please enter a valid 6-character code');
        return;
    }

    if (!window.firebaseAuth || !window.firebaseAuth.isSignedIn()) {
        alert('Please sign in first to join a trip');
        closeJoinTripModal();
        showAuthModal();
        return;
    }

    if (!window.firebaseDB) {
        alert('Firebase is not initialized');
        return;
    }

    try {
        console.log('Searching for trip with code:', code);
        const db = window.firebaseApp.db();

        // Debug logging
        try {
            const allTrips = await db.collection('trips').get();
            console.log(`Debug: Found ${allTrips.size} total trips in DB`);
            allTrips.forEach(doc => {
                const data = doc.data();
                console.log(`- Trip: ${data.name}, Code: ${data.shareCode}, ID: ${doc.id}`);
            });
        } catch (e) {
            console.log('Debug: List trips failed (expected due to rules)', e);
        }

        const snapshot = await db.collection('trips')
            .where('shareCode', '==', code)
            .get();

        console.log('Query result size:', snapshot.size);

        if (snapshot.empty) {
            alert('No trip found with code: ' + code);
            return;
        }

        const tripDoc = snapshot.docs[0];
        const tripData = tripDoc.data();
        const userEmail = window.firebaseAuth.getUserEmail();

        // Check if already a collaborator
        if (tripData.collaborators && tripData.collaborators.includes(userEmail)) {
            alert('You are already a collaborator on this trip!');
            // Even if already collaborator, we might want to refresh lists
            if (window.app) window.app.renderTrips();
            closeJoinTripModal();
            return;
        }

        // Add user as collaborator
        const collaborators = tripData.collaborators || [];
        collaborators.push(userEmail);

        await tripDoc.ref.update({
            collaborators: collaborators,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (window.app) {
            window.app.showNotification('Successfully joined trip: ' + tripData.name);
            // Re-render to show update
            window.app.renderTrips();
        }

        closeJoinTripModal();

    } catch (error) {
        console.error('Error joining trip:', error);
        alert('Error joining trip: ' + error.message);
    }
}

// Make functions globally available
window.showShareModal = showShareModal;
window.closeShareModal = closeShareModal;
window.copyShareCode = copyShareCode;
window.showJoinTripModal = showJoinTripModal;
window.closeJoinTripModal = closeJoinTripModal;
window.joinTripByCode = joinTripByCode;
