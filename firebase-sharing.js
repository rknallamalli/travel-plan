// Firebase Sharing Module
// Handles trip sharing and collaboration features

class FirebaseSharing {
    constructor() {
        this.db = null;
    }

    initialize() {
        this.db = window.firebaseApp.db();
    }

    // Get current user
    getCurrentUser() {
        return window.firebaseAuth.getCurrentUser();
    }

    // ===================================
    // SHARE TRIP
    // ===================================

    // Share trip with another user by email
    async shareTripByEmail(tripId, email, permission = 'edit') {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('User must be signed in');
            }

            // Get trip to verify ownership
            const tripRef = this.db.collection('trips').doc(tripId);
            const tripDoc = await tripRef.get();

            if (!tripDoc.exists) {
                throw new Error('Trip not found');
            }

            const tripData = tripDoc.data();

            if (tripData.ownerId !== currentUser.uid) {
                throw new Error('Only trip owner can share');
            }

            // Create invite
            const inviteRef = this.db.collection('invites').doc();
            const invite = {
                id: inviteRef.id,
                tripId: tripId,
                tripName: tripData.name,
                fromUserId: currentUser.uid,
                fromEmail: currentUser.email,
                toEmail: email.toLowerCase(),
                permission: permission,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            };

            await inviteRef.set(invite);

            console.log('✓ Invite sent to:', email);
            return { success: true, inviteId: invite.id };
        } catch (error) {
            console.error('✗ Error sharing trip:', error);
            return { success: false, error: error.message };
        }
    }

    // Get pending invites for current user
    async getMyInvites() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('User must be signed in');
            }

            const snapshot = await this.db.collection('invites')
                .where('toEmail', '==', currentUser.email.toLowerCase())
                .where('status', '==', 'pending')
                .get();

            const invites = [];
            snapshot.forEach((doc) => {
                invites.push(doc.data());
            });

            return { success: true, invites };
        } catch (error) {
            console.error('✗ Error getting invites:', error);
            return { success: false, error: error.message, invites: [] };
        }
    }

    // Accept trip invite
    async acceptInvite(inviteId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('User must be signed in');
            }

            // Get invite
            const inviteRef = this.db.collection('invites').doc(inviteId);
            const inviteDoc = await inviteRef.get();

            if (!inviteDoc.exists) {
                throw new Error('Invite not found');
            }

            const invite = inviteDoc.data();

            // Verify invite is for current user
            if (invite.toEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
                throw new Error('This invite is not for you');
            }

            // Add user to trip's sharedWith array
            const tripRef = this.db.collection('trips').doc(invite.tripId);

            await tripRef.update({
                sharedWith: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
                collaborators: firebase.firestore.FieldValue.arrayUnion({
                    userId: currentUser.uid,
                    email: currentUser.email,
                    permission: invite.permission,
                    addedAt: new Date()
                })
            });

            // Update invite status
            await inviteRef.update({
                status: 'accepted',
                acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✓ Invite accepted');
            return { success: true, tripId: invite.tripId };
        } catch (error) {
            console.error('✗ Error accepting invite:', error);
            return { success: false, error: error.message };
        }
    }

    // Decline trip invite
    async declineInvite(inviteId) {
        try {
            const inviteRef = this.db.collection('invites').doc(inviteId);

            await inviteRef.update({
                status: 'declined',
                declinedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('✓ Invite declined');
            return { success: true };
        } catch (error) {
            console.error('✗ Error declining invite:', error);
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // MANAGE COLLABORATORS
    // ===================================

    // Get trip collaborators
    async getTripCollaborators(tripId) {
        try {
            const tripRef = this.db.collection('trips').doc(tripId);
            const tripDoc = await tripRef.get();

            if (!tripDoc.exists) {
                throw new Error('Trip not found');
            }

            const tripData = tripDoc.data();
            return { success: true, collaborators: tripData.collaborators || [] };
        } catch (error) {
            console.error('✗ Error getting collaborators:', error);
            return { success: false, error: error.message, collaborators: [] };
        }
    }

    // Remove collaborator from trip
    async removeCollaborator(tripId, userId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('User must be signed in');
            }

            const tripRef = this.db.collection('trips').doc(tripId);
            const tripDoc = await tripRef.get();

            if (!tripDoc.exists) {
                throw new Error('Trip not found');
            }

            const tripData = tripDoc.data();

            // Only owner can remove collaborators
            if (tripData.ownerId !== currentUser.uid) {
                throw new Error('Only trip owner can remove collaborators');
            }

            // Find collaborator
            const collaborator = tripData.collaborators.find(c => c.userId === userId);
            if (!collaborator) {
                throw new Error('Collaborator not found');
            }

            // Remove from sharedWith and collaborators
            await tripRef.update({
                sharedWith: firebase.firestore.FieldValue.arrayRemove(userId),
                collaborators: firebase.firestore.FieldValue.arrayRemove(collaborator)
            });

            console.log('✓ Collaborator removed');
            return { success: true };
        } catch (error) {
            console.error('✗ Error removing collaborator:', error);
            return { success: false, error: error.message };
        }
    }

    // Leave shared trip (as collaborator)
    async leaveTrip(tripId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                throw new Error('User must be signed in');
            }

            const tripRef = this.db.collection('trips').doc(tripId);
            const tripDoc = await tripRef.get();

            if (!tripDoc.exists) {
                throw new Error('Trip not found');
            }

            const tripData = tripDoc.data();

            // Can't leave if you're the owner
            if (tripData.ownerId === currentUser.uid) {
                throw new Error('Trip owner cannot leave trip');
            }

            // Find your collaborator entry
            const collaborator = tripData.collaborators.find(c => c.userId === currentUser.uid);
            if (!collaborator) {
                throw new Error('You are not a collaborator on this trip');
            }

            // Remove yourself
            await tripRef.update({
                sharedWith: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
                collaborators: firebase.firestore.FieldValue.arrayRemove(collaborator)
            });

            console.log('✓ Left trip');
            return { success: true };
        } catch (error) {
            console.error('✗ Error leaving trip:', error);
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // PERMISSIONS
    // ===================================

    // Check if user can edit trip
    async canEditTrip(tripId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return false;
            }

            const tripRef = this.db.collection('trips').doc(tripId);
            const tripDoc = await tripRef.get();

            if (!tripDoc.exists) {
                return false;
            }

            const tripData = tripDoc.data();

            // Owner can always edit
            if (tripData.ownerId === currentUser.uid) {
                return true;
            }

            // Check if user is collaborator with edit permission
            const collaborator = tripData.collaborators?.find(c => c.userId === currentUser.uid);
            return collaborator && collaborator.permission === 'edit';
        } catch (error) {
            console.error('✗ Error checking edit permission:', error);
            return false;
        }
    }

    // Check if user is trip owner
    async isTripOwner(tripId) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return false;
            }

            const tripRef = this.db.collection('trips').doc(tripId);
            const tripDoc = await tripRef.get();

            if (!tripDoc.exists) {
                return false;
            }

            const tripData = tripDoc.data();
            return tripData.ownerId === currentUser.uid;
        } catch (error) {
            console.error('✗ Error checking ownership:', error);
            return false;
        }
    }
}

// Create global instance
window.firebaseSharing = new FirebaseSharing();
