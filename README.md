# NFS Minimap - Need for Speed Style GPS Navigation

A Progressive Web App that transforms your Android car system into a Need for Speed style minimap with real-time GPS tracking, rotating map, and customizable themes.

## Features

### 🎮 NFS-Style Themes
- **NFS Heat/Unbound** - Modern cyan glowing roads
- **NFS Most Wanted** - Classic blue styling
- **NFS Underground** - Neon green street racing aesthetic

### 🗺️ Real-Time GPS Tracking
- Configurable update interval (0.1s - 2s)
- Rotating minimap that keeps car centered
- Real-time speed display (KM/H or MPH)
- Street name detection
- Trail history showing your path

### 🎨 Customizable Features
- **7 Accent Colors**: Cyan, Blue, Green, Yellow, Orange, Red, Purple
- **Toggleable Elements**:
  - Speed display
  - Street names
  - Compass indicator
  - Trail history
  - Map rotation
- **Adjustable Settings**:
  - GPS update frequency
  - Map zoom level (13-19)
  - Speed unit (KM/H/MPH)

### 📱 Offline Support
- Progressive Web App (PWA) - install to home screen
- Cache map tiles for offline use
- Service worker for offline functionality
- Works without internet after caching

## Installation

### Method 1: Direct Browser Use
1. Copy all files to your Android device
2. Open `index.html` in Chrome or any modern browser
3. Grant location permissions when prompted

### Method 2: Install as PWA (Recommended)
1. Open `index.html` in Chrome
2. Tap the menu (⋮) and select "Add to Home Screen" or "Install App"
3. The app will install and can be launched like a native app
4. Enable fullscreen mode for best experience

### Method 3: Web Server
If you want to serve it properly:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Then open http://localhost:8000 in your browser
```

## Usage

### First Time Setup
1. Open the app
2. Grant location permissions when prompted
3. Wait for GPS lock (may take 10-30 seconds initially)
4. The minimap will center on your location

### Settings
Tap the settings icon (⚙️) in the top-left to access:

#### Theme Selection
Choose between Heat, Most Wanted, or Underground themes

#### Accent Color
Select from 7 different accent colors for the UI

#### GPS Update Interval
- **Lower values (0.1s)**: More responsive, higher battery usage
- **Higher values (1-2s)**: Better battery life, slightly less smooth

#### Map Zoom
Adjust from 13 (zoomed out) to 19 (zoomed in)

#### Features Toggle
Enable/disable individual features as needed

#### Offline Mode
Tap "Cache Current Area" to download map tiles for offline use
- Caches tiles in a 2km radius
- Works across multiple zoom levels
- May take a few minutes depending on connection

### Tips for Best Experience
1. **First Use**: Allow GPS to stabilize before driving
2. **Battery**: Lower GPS update interval if battery is a concern
3. **Offline**: Cache your frequent routes before going offline
4. **Performance**: Close other apps for smoother rotation
5. **Mounting**: Mount device in landscape mode for best visibility

## Technical Details

### Technologies Used
- **HTML5** - Structure and markup
- **CSS3** - Styling with NFS-inspired themes
- **JavaScript (ES6+)** - Application logic
- **Leaflet.js** - Map rendering
- **OpenStreetMap** - Map tiles and data
- **Service Workers** - Offline functionality
- **Geolocation API** - GPS tracking

### Browser Requirements
- Modern browser with Geolocation API support
- Chrome, Firefox, Safari, Edge (latest versions)
- JavaScript enabled
- Location permissions granted

### Files Structure
```
Car/
├── index.html           # Main HTML file
├── styles.css          # All styling and themes
├── app.js              # Main application logic
├── service-worker.js   # Offline functionality
├── manifest.json       # PWA configuration
├── README.md           # This file
└── img ref/           # Reference images
```

## Customization

### Adding New Themes
Edit `styles.css` and add a new theme:

```css
[data-theme="mytheme"] {
    --accent-color: #yourcolor;
}

[data-theme="mytheme"] .leaflet-tile-pane {
    filter: grayscale(100%) brightness(0.4) /* your filters */;
}
```

Then update `app.js` to include the theme in settings.

### Adjusting Minimap Size
In `styles.css`, modify `#minimap-container`:

```css
#minimap-container {
    width: 400px;  /* Change this */
    height: 400px; /* And this */
}
```

### Changing Update Intervals
Modify default in `app.js`:

```javascript
this.settings = {
    gpsInterval: 0.1, // Change default here
    // ... other settings
};
```

## Troubleshooting

### GPS Not Working
- **Check permissions**: Ensure location access is granted
- **Check GPS**: Make sure device GPS is enabled
- **Wait**: Initial GPS lock can take 30-60 seconds
- **Try outdoors**: GPS works better with clear sky view

### Map Not Loading
- **Check internet**: Map tiles require internet (first time)
- **Cache tiles**: Use "Cache Current Area" for offline use
- **Try different zoom**: Some zoom levels may load better

### Rotation Issues
- **Device orientation**: Ensure device is in landscape
- **Toggle setting**: Try disabling/enabling "Rotate Map"
- **Performance**: Close other apps if rotation is laggy

### Offline Mode Not Working
- **HTTPS required**: Some features require HTTPS
- **Cache first**: Must cache tiles while online
- **Storage space**: Ensure device has sufficient storage

## Performance Optimization

### For Better Performance
- Use lower GPS update intervals (0.5s or higher)
- Reduce map zoom level
- Disable trail history if not needed
- Clear cached tiles periodically

### For Better Accuracy
- Use 0.1s GPS update interval
- Keep GPS enabled before starting
- Use in open areas with clear sky view
- Enable high accuracy in device GPS settings

## Privacy & Data

- **Location data**: Used only locally, never transmitted
- **Map tiles**: Loaded from OpenStreetMap servers
- **Street names**: Fetched from Nominatim API
- **No tracking**: No analytics or user tracking
- **Local storage**: Settings stored only on device

## Known Limitations

- Requires GPS-enabled device
- Map tiles require internet (unless cached)
- Street name lookup requires internet
- Battery usage increases with lower update intervals
- Circular map clips some UI elements at edges

## Future Enhancements (Potential)

- Waypoint/destination markers
- Speed limit warnings
- Compass needle instead of N indicator
- More detailed car icons
- Voice navigation hints
- Route recording and playback
- Multiple car icon styles

## Credits

- **Map Data**: © OpenStreetMap contributors
- **Map Library**: Leaflet.js
- **Geocoding**: Nominatim API
- **Inspired by**: Need for Speed game series

## License

Free to use and modify for personal use.

## Support

For issues or questions, check the reference images in `img ref/` folder to see the intended design aesthetic.

---

**Enjoy your NFS-style minimap! Drive safe! 🏎️💨**
