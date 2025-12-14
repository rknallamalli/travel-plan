// ===================================
// STATE MANAGEMENT
// ===================================
class TravelPlanApp {
    constructor() {
        this.trips = [];
        this.currentTrip = null;
        this.currentDay = null;
        this.map = null;
        this.markers = [];
        this.loadFromStorage();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTrips();
        this.checkEmptyState();
        this.initializeOfflineSupport();
        this.checkOnlineStatus();
    }

    // ===================================
    // FIREBASE SYNC METHODS
    // ===================================
    enableFirebaseSync() {
        console.log('✓ Firebase sync enabled');
        this.useFirestore = true;

        window.firebaseDB.listenToMyTrips((trips) => {
            this.trips = trips;
            this.renderTrips();
            this.checkEmptyState();
            if (window.updateSyncStatus) updateSyncStatus('synced');
        });
    }

    disableFirebaseSync() {
        console.log('○ Using LocalStorage mode');
        this.useFirestore = false;
        if (window.firebaseDB) window.firebaseDB.stopListening();
        this.loadFromStorage();
        this.renderTrips();
        this.checkEmptyState();
    }

    // ===================================
    // OFFLINE SUPPORT
    // ===================================
    initializeOfflineSupport() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/travel-plan/service-worker.js')
                    .then((registration) => {
                        console.log('Service Worker registered:', registration.scope);

                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showNotification('New version available! Refresh to update.');
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.error('Service Worker registration failed:', error);
                    });
            });
        }

        // Handle install prompt for PWA
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt(deferredPrompt);
        });

        // Track if app was installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.showNotification('App installed! You can now use it offline.');
            deferredPrompt = null;
        });
    }

    showInstallPrompt(deferredPrompt) {
        // Create install banner
        const banner = document.createElement('div');
        banner.id = 'install-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: var(--gradient-primary);
            color: white;
            padding: 1rem;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            animation: slideUp 0.3s ease;
        `;

        banner.innerHTML = `
            <div>
                <strong>Install TravelPlan</strong>
                <p style="font-size: 0.875rem; margin: 0.25rem 0 0 0; opacity: 0.9;">
                    Add to home screen for offline access
                </p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary" onclick="document.getElementById('install-banner').remove()" style="background: rgba(255,255,255,0.2); border: none;">
                    Later
                </button>
                <button class="btn btn-primary" id="install-btn" style="background: white; color: var(--color-primary);">
                    Install
                </button>
            </div>
        `;

        document.body.appendChild(banner);

        document.getElementById('install-btn').addEventListener('click', async () => {
            banner.remove();
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to install prompt: ${outcome}`);
                deferredPrompt = null;
            }
        });
    }

    checkOnlineStatus() {
        const updateOnlineStatus = () => {
            const isOnline = navigator.onLine;

            // Remove existing indicator
            const existing = document.getElementById('offline-indicator');
            if (existing) existing.remove();

            if (!isOnline) {
                const indicator = document.createElement('div');
                indicator.id = 'offline-indicator';
                indicator.style.cssText = `
                    position: fixed;
                    top: 70px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--color-warning);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-full);
                    font-size: 0.875rem;
                    font-weight: 600;
                    z-index: 10000;
                    box-shadow: var(--shadow-lg);
                    animation: slideDown 0.3s ease;
                `;
                indicator.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 0.5rem;">
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                        <line x1="12" y1="20" x2="12.01" y2="20"></line>
                    </svg>
                    Offline Mode - Using cached data
                `;

                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideDown {
                        from {
                            transform: translateX(-50%) translateY(-100px);
                            opacity: 0;
                        }
                        to {
                            transform: translateX(-50%) translateY(0);
                            opacity: 1;
                        }
                    }
                `;
                document.head.appendChild(style);
                document.body.appendChild(indicator);
            }
        };

        window.addEventListener('online', () => {
            updateOnlineStatus();
            this.showNotification('Back online!');
        });

        window.addEventListener('offline', () => {
            updateOnlineStatus();
            this.showNotification('You are offline. Changes will be saved locally.');
        });

        updateOnlineStatus();
    }

    // ===================================
    // EVENT LISTENERS
    // ===================================
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });

        // Create trip button
        document.getElementById('create-trip-btn').addEventListener('click', () => {
            this.showCreateTripModal();
        });

        // Create trip form
        document.getElementById('create-trip-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTrip();
        });

        // Add activity form
        document.getElementById('add-activity-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addActivity();
        });

        // Add expense form
        document.getElementById('add-expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Edit trip form
        document.getElementById('edit-trip-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTrip();
        });

        // Trip tabs
        document.querySelectorAll('.trip-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Notes auto-save
        const notesEditor = document.getElementById('trip-notes');
        if (notesEditor) {
            notesEditor.addEventListener('input', () => {
                if (this.currentTrip) {
                    this.currentTrip.notes = notesEditor.value;
                    this.saveToStorage();
                }
            });
        }
    }

    // ===================================
    // VIEW MANAGEMENT
    // ===================================
    switchView(viewName) {
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            }
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.trip-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Initialize map when map tab is activated
        if (tabName === 'map' && this.currentTrip) {
            setTimeout(() => this.initializeMap(), 100);
        }
    }

    // ===================================
    // TRIP MANAGEMENT
    // ===================================
    createTrip() {
        const trip = {
            id: Date.now().toString(),
            name: document.getElementById('trip-name').value,
            destination: document.getElementById('trip-destination').value,
            startDate: document.getElementById('trip-start-date').value,
            endDate: document.getElementById('trip-end-date').value,
            budget: parseFloat(document.getElementById('trip-budget').value) || 0,
            description: document.getElementById('trip-description').value,
            days: [],
            expenses: [],
            notes: '',
            createdAt: new Date().toISOString()
        };

        // Generate days based on date range
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        for (let i = 0; i < dayCount; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            trip.days.push({
                id: `day-${i + 1}`,
                number: i + 1,
                date: date.toISOString().split('T')[0],
                activities: []
            });
        }

        this.trips.push(trip);
        this.saveToStorage();
        this.renderTrips();
        this.checkEmptyState();
        this.closeModal('create-trip-modal');

        // Reset form
        document.getElementById('create-trip-form').reset();

        // Show success animation
        this.showNotification('Trip created successfully!');
    }

    viewTrip(tripId) {
        this.currentTrip = this.trips.find(t => t.id === tripId);
        if (!this.currentTrip) return;

        // Update trip header
        document.getElementById('trip-detail-title').textContent = this.currentTrip.name;
        document.getElementById('trip-detail-dates').textContent =
            `${this.formatDate(this.currentTrip.startDate)} - ${this.formatDate(this.currentTrip.endDate)}`;
        document.getElementById('trip-detail-budget').textContent =
            `Budget: $${this.currentTrip.budget.toLocaleString()}`;

        // Render itinerary
        this.renderItinerary();

        // Render expenses
        this.renderExpenses();

        // Load notes
        document.getElementById('trip-notes').value = this.currentTrip.notes || '';

        // Switch to trip detail view
        this.switchView('trip-detail');
    }

    deleteTrip(tripId) {
        if (confirm('Are you sure you want to delete this trip?')) {
            this.trips = this.trips.filter(t => t.id !== tripId);
            this.saveToStorage();
            this.renderTrips();
            this.checkEmptyState();
            this.showNotification('Trip deleted');
            // Go back to trips view
            this.switchView('trips');
        }
    }

    showEditTripModal() {
        if (!this.currentTrip) return;

        // Populate form with current trip data
        document.getElementById('edit-trip-name').value = this.currentTrip.name;
        document.getElementById('edit-trip-destination').value = this.currentTrip.destination;
        document.getElementById('edit-trip-start-date').value = this.currentTrip.startDate;
        document.getElementById('edit-trip-end-date').value = this.currentTrip.endDate;
        document.getElementById('edit-trip-budget').value = this.currentTrip.budget || '';
        document.getElementById('edit-trip-description').value = this.currentTrip.description || '';

        this.showModal('edit-trip-modal');
    }

    updateTrip() {
        if (!this.currentTrip) return;

        const oldStartDate = this.currentTrip.startDate;
        const oldEndDate = this.currentTrip.endDate;

        // Update trip details
        this.currentTrip.name = document.getElementById('edit-trip-name').value;
        this.currentTrip.destination = document.getElementById('edit-trip-destination').value;
        this.currentTrip.startDate = document.getElementById('edit-trip-start-date').value;
        this.currentTrip.endDate = document.getElementById('edit-trip-end-date').value;
        this.currentTrip.budget = parseFloat(document.getElementById('edit-trip-budget').value) || 0;
        this.currentTrip.description = document.getElementById('edit-trip-description').value;

        // Check if dates changed
        if (oldStartDate !== this.currentTrip.startDate || oldEndDate !== this.currentTrip.endDate) {
            this.adjustTripDays();
        }

        this.saveToStorage();
        this.renderTrips();

        // Update the trip detail view
        document.getElementById('trip-detail-title').textContent = this.currentTrip.name;
        document.getElementById('trip-detail-dates').textContent =
            `${this.formatDate(this.currentTrip.startDate)} - ${this.formatDate(this.currentTrip.endDate)}`;
        document.getElementById('trip-detail-budget').textContent =
            `Budget: $${this.currentTrip.budget.toLocaleString()}`;

        this.renderItinerary();
        this.renderExpenses();

        this.closeModal('edit-trip-modal');
        this.showNotification('Trip updated successfully!');
    }

    adjustTripDays() {
        // Calculate new day count
        const start = new Date(this.currentTrip.startDate);
        const end = new Date(this.currentTrip.endDate);
        const newDayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        const currentDayCount = this.currentTrip.days.length;

        if (newDayCount > currentDayCount) {
            // Add new days
            for (let i = currentDayCount; i < newDayCount; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                this.currentTrip.days.push({
                    id: `day-${i + 1}`,
                    number: i + 1,
                    date: date.toISOString().split('T')[0],
                    activities: []
                });
            }
        } else if (newDayCount < currentDayCount) {
            // Remove extra days (keep activities from removed days)
            this.currentTrip.days = this.currentTrip.days.slice(0, newDayCount);
        }

        // Update dates for existing days
        this.currentTrip.days.forEach((day, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            day.date = date.toISOString().split('T')[0];
            day.number = index + 1;
        });
    }

    // ===================================
    // ITINERARY MANAGEMENT
    // ===================================
    renderItinerary() {
        const timeline = document.getElementById('itinerary-timeline');
        timeline.innerHTML = '';

        this.currentTrip.days.forEach(day => {
            const dayCard = this.createDayCard(day);
            timeline.appendChild(dayCard);
        });
    }

    createDayCard(day) {
        const card = document.createElement('div');
        card.className = 'day-card';
        card.innerHTML = `
            <div class="day-header">
                <div>
                    <h3 class="day-title">Day ${day.number}</h3>
                    <p class="day-date">${this.formatDate(day.date)}</p>
                </div>
            </div>
            <div class="activities-list" id="activities-${day.id}">
                ${day.activities.map(activity => this.createActivityHTML(activity)).join('')}
            </div>
            <button class="add-activity-btn" onclick="app.showAddActivityModal('${day.id}')">
                + Add Activity
            </button>
        `;
        return card;
    }

    createActivityHTML(activity) {
        const icons = {
            attraction: '🏛️',
            restaurant: '🍽️',
            accommodation: '🏨',
            transport: '🚗',
            activity: '🎯',
            other: '📍'
        };

        return `
            <div class="activity-item">
                <div class="activity-icon">
                    ${icons[activity.type] || '📍'}
                </div>
                <div class="activity-content">
                    <div class="activity-name">${activity.name}</div>
                    <div class="activity-details">
                        ${activity.time ? `
                            <span class="activity-time">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                ${activity.time}
                            </span>
                        ` : ''}
                        ${activity.location ? `
                            <span class="activity-location">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                ${activity.location}
                            </span>
                        ` : ''}
                    </div>
                    ${activity.notes ? `<p style="font-size: 0.875rem; color: var(--color-text-tertiary); margin-top: 0.5rem;">${activity.notes}</p>` : ''}
                </div>
            </div>
        `;
    }

    showAddActivityModal(dayId) {
        this.currentDay = this.currentTrip.days.find(d => d.id === dayId);
        this.showModal('add-activity-modal');
    }

    addActivity() {
        if (!this.currentDay) return;

        const activity = {
            id: Date.now().toString(),
            name: document.getElementById('activity-name').value,
            type: document.getElementById('activity-type').value,
            time: document.getElementById('activity-time').value,
            duration: parseFloat(document.getElementById('activity-duration').value) || 0,
            location: document.getElementById('activity-location').value,
            notes: document.getElementById('activity-notes').value
        };

        this.currentDay.activities.push(activity);
        this.saveToStorage();
        this.renderItinerary();
        this.closeModal('add-activity-modal');

        // Reset form
        document.getElementById('add-activity-form').reset();

        this.showNotification('Activity added!');
    }

    // ===================================
    // EXPENSE MANAGEMENT
    // ===================================
    renderExpenses() {
        const expensesList = document.getElementById('expenses-list');
        const totalSpent = this.currentTrip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const remaining = this.currentTrip.budget - totalSpent;

        // Update summary
        document.getElementById('total-budget').textContent = `$${this.currentTrip.budget.toLocaleString()}`;
        document.getElementById('total-spent').textContent = `$${totalSpent.toLocaleString()}`;
        document.getElementById('remaining-budget').textContent = `$${remaining.toLocaleString()}`;

        // Render expense list
        if (this.currentTrip.expenses.length === 0) {
            expensesList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--color-text-tertiary);">
                    <p>No expenses yet</p>
                </div>
            `;
            return;
        }

        expensesList.innerHTML = this.currentTrip.expenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(expense => `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-name">${expense.name}</div>
                        <div class="expense-meta">
                            <span>${expense.category}</span>
                            <span>${this.formatDate(expense.date)}</span>
                        </div>
                    </div>
                    <div class="expense-value">$${expense.amount.toLocaleString()}</div>
                </div>
            `).join('');
    }

    addExpense() {
        if (!this.currentTrip) return;

        const expense = {
            id: Date.now().toString(),
            name: document.getElementById('expense-name').value,
            amount: parseFloat(document.getElementById('expense-amount').value),
            category: document.getElementById('expense-category').value,
            date: document.getElementById('expense-date').value
        };

        this.currentTrip.expenses.push(expense);
        this.saveToStorage();
        this.renderExpenses();
        this.closeModal('add-expense-modal');

        // Reset form
        document.getElementById('add-expense-form').reset();

        this.showNotification('Expense added!');
    }

    // ===================================
    // RENDERING
    // ===================================
    renderTrips() {
        const grid = document.getElementById('trips-grid');
        grid.innerHTML = '';

        this.trips.forEach(trip => {
            const card = this.createTripCard(trip);
            grid.appendChild(card);
        });
    }

    createTripCard(trip) {
        const card = document.createElement('div');
        card.className = 'trip-card';
        card.onclick = () => this.viewTrip(trip.id);

        const dayCount = trip.days.length;
        const activityCount = trip.days.reduce((sum, day) => sum + day.activities.length, 0);
        const totalSpent = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);

        card.innerHTML = `
            <div class="trip-card-header">
                <div>
                    <h3 class="trip-card-title">${trip.name}</h3>
                    <div class="trip-card-destination">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${trip.destination}
                    </div>
                </div>
                <div class="trip-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    </svg>
                </div>
            </div>
            <div class="trip-card-body">
                <div class="trip-card-dates">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${this.formatDate(trip.startDate)} - ${this.formatDate(trip.endDate)}
                </div>
            </div>
            <div class="trip-card-stats">
                <div class="trip-stat">
                    <div class="trip-stat-label">Days</div>
                    <div class="trip-stat-value">${dayCount}</div>
                </div>
                <div class="trip-stat">
                    <div class="trip-stat-label">Activities</div>
                    <div class="trip-stat-value">${activityCount}</div>
                </div>
                <div class="trip-stat">
                    <div class="trip-stat-label">Spent</div>
                    <div class="trip-stat-value">$${totalSpent.toLocaleString()}</div>
                </div>
            </div>
        `;

        return card;
    }

    checkEmptyState() {
        const emptyState = document.getElementById('empty-trips');
        const tripsGrid = document.getElementById('trips-grid');

        if (this.trips.length === 0) {
            emptyState.classList.add('active');
            tripsGrid.style.display = 'none';
        } else {
            emptyState.classList.remove('active');
            tripsGrid.style.display = 'grid';
        }
    }

    // ===================================
    // MODAL MANAGEMENT
    // ===================================
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showCreateTripModal() {
        // Set default dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        document.getElementById('trip-start-date').value = today.toISOString().split('T')[0];
        document.getElementById('trip-end-date').value = tomorrow.toISOString().split('T')[0];

        this.showModal('create-trip-modal');
    }

    // ===================================
    // UTILITY FUNCTIONS
    // ===================================
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gradient-primary);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-xl);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }

    // ===================================
    // LOCAL STORAGE
    // ===================================
    saveToStorage() {
        try {
            localStorage.setItem('travelplan-trips', JSON.stringify(this.trips));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('travelplan-trips');
            if (stored) {
                this.trips = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.trips = [];
        }
    }

    // ===================================
    // MAP MANAGEMENT
    // ===================================
    initializeMap() {
        // Destroy existing map if it exists
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Clear markers
        this.markers = [];

        // Initialize Leaflet map
        this.map = L.map('trip-map').setView([20, 0], 2);

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Plot all activities with locations
        this.plotTripLocations();
    }

    async plotTripLocations() {
        if (!this.currentTrip || !this.map) return;

        const locations = [];

        // Collect all locations from activities
        for (const day of this.currentTrip.days) {
            for (const activity of day.activities) {
                if (activity.location) {
                    locations.push({
                        name: activity.name,
                        location: activity.location,
                        type: activity.type,
                        time: activity.time,
                        day: day.number
                    });
                }
            }
        }

        // Also add the main destination
        if (this.currentTrip.destination) {
            locations.unshift({
                name: this.currentTrip.destination,
                location: this.currentTrip.destination,
                type: 'destination',
                isMain: true
            });
        }

        if (locations.length === 0) {
            // No locations to plot
            this.showNotification('No locations to display on map');
            return;
        }

        // Geocode and add markers
        const bounds = [];
        for (const loc of locations) {
            try {
                const coords = await this.geocodeLocation(loc.location);
                if (coords) {
                    const marker = this.addMarker(coords, loc);
                    bounds.push(coords);
                }
            } catch (error) {
                console.error(`Failed to geocode ${loc.location}:`, error);
            }
        }

        // Fit map to show all markers
        if (bounds.length > 0) {
            if (bounds.length === 1) {
                this.map.setView(bounds[0], 13);
            } else {
                this.map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }

    async geocodeLocation(location) {
        // Use Nominatim (OpenStreetMap) geocoding service
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'TravelPlan App'
                }
            });
            const data = await response.json();

            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }

        return null;
    }

    addMarker(coords, locationData) {
        const icons = {
            destination: '🎯',
            attraction: '🏛️',
            restaurant: '🍽️',
            accommodation: '🏨',
            transport: '🚗',
            activity: '🎯',
            other: '📍'
        };

        const icon = icons[locationData.type] || '📍';

        // Create custom icon
        const customIcon = L.divIcon({
            html: `<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${icon}</div>`,
            className: 'custom-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        const marker = L.marker(coords, { icon: customIcon }).addTo(this.map);

        // Create popup content
        let popupContent = `<h3>${locationData.name}</h3>`;
        if (locationData.day) {
            popupContent += `<p>Day ${locationData.day}`;
            if (locationData.time) {
                popupContent += ` at ${locationData.time}`;
            }
            popupContent += `</p>`;
        }
        if (locationData.isMain) {
            popupContent += `<p>Main Destination</p>`;
        }

        marker.bindPopup(popupContent);

        this.markers.push(marker);
        return marker;
    }

    centerMap() {
        if (!this.map || this.markers.length === 0) return;

        const bounds = this.markers.map(m => m.getLatLng());
        if (bounds.length === 1) {
            this.map.setView(bounds[0], 13);
        } else {
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

// ===================================
// GLOBAL FUNCTIONS (for inline handlers)
// ===================================
function showView(viewName) {
    app.switchView(viewName);
}

function showCreateTripModal() {
    app.showCreateTripModal();
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function addDay() {
    if (!app.currentTrip) return;

    const lastDay = app.currentTrip.days[app.currentTrip.days.length - 1];
    const newDate = new Date(lastDay.date);
    newDate.setDate(newDate.getDate() + 1);

    const newDay = {
        id: `day-${app.currentTrip.days.length + 1}`,
        number: app.currentTrip.days.length + 1,
        date: newDate.toISOString().split('T')[0],
        activities: []
    };

    app.currentTrip.days.push(newDay);
    app.currentTrip.endDate = newDate.toISOString().split('T')[0];
    app.saveToStorage();
    app.renderItinerary();
    app.showNotification('Day added!');
}

function addExpense() {
    app.showModal('add-expense-modal');
    // Set default date to today
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
}

function shareTrip() {
    if (!app.currentTrip) return;

    const shareText = `Check out my trip: ${app.currentTrip.name} to ${app.currentTrip.destination}!`;

    if (navigator.share) {
        navigator.share({
            title: app.currentTrip.name,
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            app.showNotification('Trip details copied to clipboard!');
        });
    }
}

function editTrip() {
    if (!app.currentTrip) return;
    app.showEditTripModal();
}

function confirmDeleteTrip() {
    if (!app.currentTrip) return;

    if (confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
        const tripId = app.currentTrip.id;
        app.closeModal('edit-trip-modal');
        app.deleteTrip(tripId);
    }
}

// ===================================
// INITIALIZE APP
// ===================================
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TravelPlanApp();

    // Add some demo data if no trips exist
    if (app.trips.length === 0) {
        addDemoTrip();
    }
});

// Demo trip for first-time users
function addDemoTrip() {
    const demoTrip = {
        id: 'demo-' + Date.now(),
        name: 'Summer in Paris',
        destination: 'Paris, France',
        startDate: '2025-07-15',
        endDate: '2025-07-20',
        budget: 3500,
        description: 'A romantic getaway to the City of Light',
        days: [
            {
                id: 'day-1',
                number: 1,
                date: '2025-07-15',
                activities: [
                    {
                        id: 'act-1',
                        name: 'Visit Eiffel Tower',
                        type: 'attraction',
                        time: '10:00',
                        duration: 3,
                        location: 'Champ de Mars, Paris',
                        notes: 'Book tickets in advance'
                    },
                    {
                        id: 'act-2',
                        name: 'Lunch at Le Jules Verne',
                        type: 'restaurant',
                        time: '13:00',
                        duration: 2,
                        location: 'Eiffel Tower, 2nd Floor',
                        notes: 'Reservation required'
                    }
                ]
            },
            {
                id: 'day-2',
                number: 2,
                date: '2025-07-16',
                activities: [
                    {
                        id: 'act-3',
                        name: 'Louvre Museum',
                        type: 'attraction',
                        time: '09:00',
                        duration: 4,
                        location: 'Rue de Rivoli, Paris',
                        notes: 'See Mona Lisa and Venus de Milo'
                    }
                ]
            }
        ],
        expenses: [
            {
                id: 'exp-1',
                name: 'Hotel Booking',
                amount: 800,
                category: 'accommodation',
                date: '2025-07-15'
            },
            {
                id: 'exp-2',
                name: 'Flight Tickets',
                amount: 650,
                category: 'transport',
                date: '2025-07-15'
            }
        ],
        notes: 'Remember to bring camera and comfortable walking shoes!',
        createdAt: new Date().toISOString()
    };

    app.trips.push(demoTrip);
    app.saveToStorage();
    app.renderTrips();
    app.checkEmptyState();
}

// Center map function
function centerMap() {
    if (app && app.map) {
        app.centerMap();
    }
}
