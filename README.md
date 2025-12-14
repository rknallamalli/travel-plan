# TravelPlan - Offline Travel Planning PWA

A beautiful, feature-rich **Progressive Web App** for travel planning that works completely offline on iPhone and other devices. Inspired by Wanderlog, plan your trips, create detailed itineraries, track expenses, and visualize routes - all without internet connection!

![TravelPlan App](screenshot.png)

## 🌟 Key Highlights

### 📱 **Works Fully Offline on iPhone**
- ✅ Install to home screen like a native app
- ✅ All features work without internet
- ✅ Data saved locally on your device
- ✅ Cached maps for offline viewing
- ✅ Perfect for international travel

### 🚀 **Progressive Web App (PWA)**
- **Installable**: Add to iPhone home screen
- **Offline-First**: Service worker caching
- **Fast**: Instant loading from cache
- **Reliable**: Works without connection
- **Native Feel**: Full-screen app experience

## 🌟 Features

### Core Functionality
- **Trip Management**: Create, edit, and delete multiple trips
- **Day-by-Day Itinerary**: Plan your activities with detailed schedules
- **Interactive Maps**: Leaflet.js maps with offline tile caching
- **Expense Tracking**: Monitor your budget and track spending by category
- **Trip Notes**: Keep important information and ideas organized
- **Share Trips**: Share trip details with friends and family

### Activity Planning
- Add activities with:
  - Name and type (attraction, restaurant, accommodation, transport, etc.)
  - Time and duration
  - Location details (with geocoding)
  - Personal notes
- Visual timeline with emoji icons for different activity types
- Easy-to-use interface for adding and organizing activities
- Automatic map plotting of all locations

### Expense Management
- Track expenses by category:
  - Accommodation
  - Food & Drinks
  - Transport
  - Activities
  - Shopping
  - Other
- Real-time budget tracking
- Visual summary showing total budget, spent amount, and remaining balance
- Detailed expense list with dates and categories

### Offline Capabilities 🔌
- **Service Worker**: Caches all app assets for offline use
- **Map Tiles**: Cached OpenStreetMap tiles
- **Geocoding Cache**: Previously looked-up locations work offline
- **Local Storage**: All trip data persists offline
- **Offline Indicator**: Visual feedback when disconnected
- **Auto-Sync**: Updates when connection returns

## 🎨 Design Features

### Premium Dark Theme
- Modern, eye-catching dark color scheme
- Vibrant gradients and accent colors
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions

### Responsive Design
- Works on desktop, tablet, and mobile devices
- Adaptive layouts for different screen sizes
- Touch-friendly interface

### User Experience
- Intuitive navigation
- Smooth page transitions
- Hover effects and micro-animations
- Toast notifications for user feedback
- Modal dialogs for data entry

## 🚀 Getting Started

### Installation
No installation required! Simply open `index.html` in a modern web browser.

```bash
# Clone or download the files
# Navigate to the directory
cd wanderlog-clone

# Open in browser (or just double-click index.html)
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux
```

### First Time Use
1. The app will load with a demo trip "Summer in Paris" to showcase features
2. Click on the trip card to view details
3. Explore different tabs: Itinerary, Map, Expenses, Notes
4. Create your own trip by clicking "New Trip" button

## 📖 How to Use

### Creating a Trip
1. Click the **"New Trip"** button in the navigation bar
2. Fill in trip details:
   - Trip name
   - Destination
   - Start and end dates
   - Budget (optional)
   - Description (optional)
3. Click **"Create Trip"**
4. The app automatically generates days based on your date range

### Adding Activities
1. Open a trip to view its details
2. Navigate to the **Itinerary** tab
3. Click **"+ Add Activity"** on any day
4. Fill in activity details:
   - Activity name
   - Type (attraction, restaurant, etc.)
   - Time and duration
   - Location
   - Notes
5. Click **"Add Activity"**

### Tracking Expenses
1. Open a trip and go to the **Expenses** tab
2. Click **"Add Expense"**
3. Enter expense details:
   - Description
   - Amount
   - Category
   - Date
4. Click **"Add Expense"**
5. View your budget summary at the top

### Adding Notes
1. Open a trip and go to the **Notes** tab
2. Type your notes in the text editor
3. Notes are automatically saved as you type

### Sharing Trips
1. Open a trip
2. Click the **"Share"** button
3. Use your device's native share functionality or copy to clipboard

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript**: ES6+ features, class-based architecture
- **Local Storage API**: Data persistence

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### File Structure
```
wanderlog-clone/
├── index.html          # Main HTML structure
├── index.css           # Complete styling and design system
├── app.js              # Application logic and state management
└── README.md           # Documentation
```

## 🎯 Key Features Comparison with Wanderlog

| Feature | TravelPlan | Wanderlog |
|---------|-----------|-----------|
| Trip Creation | ✅ | ✅ |
| Day-by-Day Itinerary | ✅ | ✅ |
| Activity Planning | ✅ | ✅ |
| Expense Tracking | ✅ | ✅ |
| Trip Notes | ✅ | ✅ |
| Offline Access | ✅ | ✅ |
| Map Integration | 🔄 Placeholder | ✅ |
| Collaboration | 🔄 Share only | ✅ Real-time |
| Booking Integration | ❌ | ✅ |
| Mobile Apps | ❌ Web only | ✅ iOS/Android |

✅ = Fully implemented
🔄 = Partially implemented
❌ = Not implemented

## 🔮 Future Enhancements

### Planned Features
- [ ] Google Maps integration for interactive maps
- [ ] Real-time collaboration with WebSockets
- [ ] Import reservations from email
- [ ] Export to PDF/Google Maps
- [ ] Photo gallery for trips
- [ ] Weather integration
- [ ] Currency converter
- [ ] Packing list feature
- [ ] Flight/hotel booking integration
- [ ] Progressive Web App (PWA) support
- [ ] Cloud sync across devices
- [ ] Multi-language support

### Potential Integrations
- Google Maps API
- OpenWeatherMap API
- Currency exchange APIs
- Flight/hotel booking APIs
- Photo storage services

## 💡 Usage Tips

1. **Budget Planning**: Set realistic budgets and track expenses daily
2. **Activity Timing**: Add time estimates to activities for better planning
3. **Notes**: Use the notes section for important details like confirmation numbers
4. **Regular Backups**: Export your data periodically (browser storage can be cleared)
5. **Mobile Use**: Add to home screen for app-like experience on mobile

## 🐛 Known Limitations

- Map view is currently a placeholder (requires API integration)
- No cloud sync - data is stored locally only
- No real-time collaboration features
- No booking integration
- Limited to single browser/device without manual export

## 📝 License

This is a demonstration project created for educational purposes. Feel free to use and modify as needed.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📧 Support

For questions or issues, please refer to the code comments or create an issue in the repository.

---

**Built with ❤️ for travelers who love to plan**

Enjoy planning your next adventure! ✈️🗺️🌍
