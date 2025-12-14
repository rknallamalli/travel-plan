// Quick Share Button Injector
// Adds Share button to trip cards

document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to load
    setTimeout(() => {
        addShareButtonsToTrips();
    }, 1000);
});

function addShareButtonsToTrips() {
    // Add Share button to each trip card
    const tripCards = document.querySelectorAll('.trip-card');

    tripCards.forEach((card, index) => {
        // Check if Share button already exists
        if (card.querySelector('.share-btn')) return;

        // Create Share button
        const shareBtn = document.createElement('button');
        shareBtn.className = 'btn btn-secondary share-btn';
        shareBtn.style.cssText = 'position: absolute; top: 1rem; right: 1rem; padding: 0.5rem; z-index: 10;';
        shareBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
        `;
        shareBtn.title = 'Share Trip';

        // Add click handler
        shareBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent opening trip

            // Get trip by index
            if (window.app && window.app.trips && window.app.trips[index]) {
                window.app.currentTrip = window.app.trips[index];
                console.log('Sharing trip:', window.app.currentTrip.name);
                showShareModal();
            } else {
                console.error('Could not find trip at index', index);
            }
        };

        // Add to card
        card.style.position = 'relative';
        card.appendChild(shareBtn);
    });
}

// Re-add buttons when trips are rendered
if (window.app) {
    const originalRenderTrips = window.app.renderTrips;
    window.app.renderTrips = function () {
        originalRenderTrips.call(this);
        setTimeout(addShareButtonsToTrips, 100);
    };
}
