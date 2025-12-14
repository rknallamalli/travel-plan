// Firebase Firestore Database Module
// Handles all database operations for trips

class FirebaseDatabase {
    constructor() {
        this.db = null;
        this.tripsListener = null;
        this.sharedTripsListener = null;
    }

    initialize() {
        this.db = window.firebaseApp.db();
    }

    // Get current user ID
    getCurrentUserId() {
        const user = window.firebaseAuth.getCurrentUser();
        return user ? user.uid : null;
    }

    // ===================================
    // TRIP CRUD OPERATIONS
    // ===================================

    // Create a new trip
    async createTrip(tripData) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User must be signed in to create trips');
            }

            const tripRef = this.db.collection('trips').doc();

            const trip = {
                ...tripData,
                id: tripRef.id,
                ownerId: userId,
                ownerEmail: window.firebaseAuth.getUserEmail(),
                sharedWith: [],
                collaborators: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastModifiedBy: userId
            };

            await tripRef.set(trip);

            console.log('✓ Trip created:', trip.id);
            return { success: true, tripId: trip.id, trip };
        } catch (error) {
            console.error('✗ Error creating trip:', error);
            return { success: false, error: error.message };
        }
    }

    // Update an existing trip
    async updateTrip(tripId, updates) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User must be signed in');
            }

            const tripRef = this.db.collection('trips').doc(tripId);

            await tripRef.update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastModifiedBy: userId
            });

            console.log('✓ Trip updated:', tripId);
            return { success: true };
        } catch (error) {
            console.error('✗ Error updating trip:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete a trip
    async deleteTrip(tripId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User must be signed in');
            }

            await this.db.collection('trips').doc(tripId).delete();

            console.log('✓ Trip deleted:', tripId);
            return { success: true };
        } catch (error) {
            console.error('✗ Error deleting trip:', error);
            return { success: false, error: error.message };
        }
    }

    // Get a single trip
    async getTrip(tripId) {
        try {
            const doc = await this.db.collection('trips').doc(tripId).get();

            if (!doc.exists) {
                throw new Error('Trip not found');
            }

            return { success: true, trip: doc.data() };
        } catch (error) {
            console.error('✗ Error getting trip:', error);
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // REAL-TIME LISTENERS
    // ===================================

    // Listen to user's own trips
    listenToMyTrips(callback) {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn('User not signed in, cannot listen to trips');
            return null;
        }

        // Unsubscribe from previous listener
        if (this.tripsListener) {
            this.tripsListener();
        }

        this.tripsListener = this.db.collection('trips')
            .where('ownerId', '==', userId)
            .onSnapshot(
                (snapshot) => {
                    const trips = [];
                    snapshot.forEach((doc) => {
                        trips.push(doc.data());
                    });

                    console.log(`✓ Received ${trips.length} trips from Firestore`);
                    callback(trips);
                },
                (error) => {
                    console.error('✗ Error listening to trips:', error);
                    callback([]);
                }
            );

        return this.tripsListener;
    }

    // Listen to shared trips
    listenToSharedTrips(callback) {
        const userId = this.getCurrentUserId();
        if (!userId) {
            console.warn('User not signed in, cannot listen to shared trips');
            return null;
        }

        // Unsubscribe from previous listener
        if (this.sharedTripsListener) {
            this.sharedTripsListener();
        }

        this.sharedTripsListener = this.db.collection('trips')
            .where('sharedWith', 'array-contains', userId)
            .onSnapshot(
                (snapshot) => {
                    const trips = [];
                    snapshot.forEach((doc) => {
                        trips.push(doc.data());
                    });

                    console.log(`✓ Received ${trips.length} shared trips from Firestore`);
                    callback(trips);
                },
                (error) => {
                    console.error('✗ Error listening to shared trips:', error);
                    callback([]);
                }
            );

        return this.sharedTripsListener;
    }

    // Stop listening to trips
    stopListening() {
        if (this.tripsListener) {
            this.tripsListener();
            this.tripsListener = null;
        }
        if (this.sharedTripsListener) {
            this.sharedTripsListener();
            this.sharedTripsListener = null;
        }
    }

    // ===================================
    // BATCH OPERATIONS
    // ===================================

    // Get all user's trips (one-time read)
    async getAllMyTrips() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User must be signed in');
            }

            const snapshot = await this.db.collection('trips')
                .where('ownerId', '==', userId)
                .orderBy('updatedAt', 'desc')
                .get();

            const trips = [];
            snapshot.forEach((doc) => {
                trips.push(doc.data());
            });

            return { success: true, trips };
        } catch (error) {
            console.error('✗ Error getting trips:', error);
            return { success: false, error: error.message, trips: [] };
        }
    }

    // ===================================
    // MIGRATION HELPERS
    // ===================================

    // Import trips from LocalStorage to Firestore
    async importTripsFromLocalStorage(trips) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User must be signed in');
            }

            const batch = this.db.batch();
            let count = 0;

            for (const trip of trips) {
                const tripRef = this.db.collection('trips').doc();

                const firestoreTrip = {
                    ...trip,
                    id: tripRef.id,
                    ownerId: userId,
                    ownerEmail: window.firebaseAuth.getUserEmail(),
                    sharedWith: [],
                    collaborators: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastModifiedBy: userId
                };

                batch.set(tripRef, firestoreTrip);
                count++;
            }

            await batch.commit();

            console.log(`✓ Imported ${count} trips to Firestore`);
            return { success: true, count };
        } catch (error) {
            console.error('✗ Error importing trips:', error);
            return { success: false, error: error.message };
        }
    }

    // ===================================
    // USAGE MONITORING
    // ===================================

    // Get approximate usage stats
    async getUsageStats() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                return { trips: 0, estimatedReads: 0, estimatedWrites: 0 };
            }

            const snapshot = await this.db.collection('trips')
                .where('ownerId', '==', userId)
                .get();

            const tripCount = snapshot.size;

            // Rough estimates
            const estimatedReads = tripCount * 2; // Opening app + syncing
            const estimatedWrites = tripCount * 0.5; // Occasional updates

            return {
                trips: tripCount,
                estimatedReads,
                estimatedWrites,
                percentOfFreeLimit: {
                    reads: (estimatedReads / 50000 * 100).toFixed(2),
                    writes: (estimatedWrites / 20000 * 100).toFixed(2)
                }
            };
        } catch (error) {
            console.error('✗ Error getting usage stats:', error);
            return { trips: 0, estimatedReads: 0, estimatedWrites: 0 };
        }
    }
}

// Create global instance
window.firebaseDB = new FirebaseDatabase();
