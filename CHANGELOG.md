# Changelog

All notable changes to TravelPlan will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-14

### 🎉 Initial Release

#### Added
- **Trip Management**
  - Create new trips with name, destination, dates, and budget
  - Edit existing trips with full update capability
  - Delete trips with confirmation
  - Automatic day generation based on date range
  - Smart date adjustment when editing trip duration

- **Itinerary Planning**
  - Day-by-day timeline view
  - Add activities with type, time, duration, location, and notes
  - Activity types: Attraction, Restaurant, Accommodation, Transport, Activity, Other
  - Visual emoji icons for different activity types
  - Add unlimited days to trips

- **Interactive Maps**
  - Leaflet.js integration with OpenStreetMap tiles
  - Automatic geocoding using Nominatim API
  - Custom emoji markers for different location types
  - Interactive popups with activity details
  - Automatic map bounds fitting
  - Center map button for easy navigation
  - Offline map tile caching

- **Expense Tracking**
  - Add expenses with description, amount, category, and date
  - Expense categories: Accommodation, Food & Drinks, Transport, Activities, Shopping, Other
  - Real-time budget summary
  - Visual display of total budget, spent, and remaining
  - Expense list sorted by date

- **Trip Notes**
  - Rich text editor for trip notes
  - Auto-save functionality
  - Persistent storage

- **Progressive Web App (PWA)**
  - Service Worker for offline support
  - Web App Manifest for installability
  - Offline-first architecture
  - Cache-first strategy for app assets
  - Network-first with cache fallback for API calls
  - Offline map tile caching
  - Geocoding response caching

- **iPhone Optimization**
  - Add to home screen support
  - Standalone app mode (no browser UI)
  - Custom app icons (192x192, 512x512)
  - iOS-specific meta tags
  - Viewport fit for notched displays
  - Status bar styling
  - Install prompt banner

- **Offline Support**
  - Complete offline functionality
  - Visual offline indicator
  - Online/offline status notifications
  - Service worker registration
  - Asset caching
  - Map tile caching
  - API response caching

- **User Interface**
  - Premium dark theme design
  - Gradient accents and glassmorphism effects
  - Smooth animations and transitions
  - Responsive layout for all devices
  - Toast notifications for user feedback
  - Modal dialogs for data entry
  - Empty states with helpful messages

- **Data Persistence**
  - LocalStorage for trip data
  - Service Worker cache for assets
  - Automatic save on all changes
  - No account required
  - Privacy-first (all data local)

- **Sharing**
  - Share trip details via native share API
  - Copy to clipboard fallback
  - Share button in trip detail view

#### Technical Details
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with custom properties
- **Maps**: Leaflet.js 1.9.4
- **Tiles**: OpenStreetMap
- **Geocoding**: Nominatim API
- **Storage**: LocalStorage + Cache API
- **PWA**: Service Worker + Manifest
- **Fonts**: Inter & Outfit from Google Fonts

#### Browser Support
- iOS Safari 11.3+
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

#### Known Limitations
- Map tiles require initial online viewing to cache
- Geocoding new addresses requires internet connection
- No cloud sync (all data local only)
- No real-time collaboration
- No booking integration
- Limited to ~50MB cache storage for maps

#### Documentation
- README.md - Main documentation
- OFFLINE-GUIDE.md - Comprehensive offline usage guide
- PWA-SUMMARY.md - PWA implementation details
- GITHUB-DEPLOYMENT.md - GitHub Pages deployment guide
- START-HERE.md - Quick start guide
- DEPLOYMENT-GUIDE.md - Alternative hosting options

---

## Future Releases

### Planned for v1.1.0
- [ ] Export trips to PDF
- [ ] Import trips from JSON
- [ ] Photo attachments for activities
- [ ] Weather integration
- [ ] Currency converter
- [ ] Packing list feature

### Planned for v2.0.0
- [ ] Cloud sync with Firebase
- [ ] Real-time collaboration
- [ ] User accounts (optional)
- [ ] Flight/hotel booking integration
- [ ] Offline geocoding database
- [ ] Downloadable map regions
- [ ] Multi-language support

---

## Version History

- **1.0.0** (2025-12-14) - Initial release
- [ ] Added Firebase authentication (Google & Email)
- [ ] Real-time cloud sync with Firestore
- [ ] Trip sharing and collaboration
- [ ] Offline-first architecture maintained
- [ ] User authentication UI

---

**Repository**: https://github.com/rknallamalli/travel-plan  
**Live Demo**: https://rknallamalli.github.io/travel-plan/  
**License**: MIT

