# NFS Minimap Changelog

## Version 1.1 - Smooth Rotation Update

### New Features

#### 🧭 North Indicator
- Added outer north arrow indicator on the minimap border
- Arrow rotates to always point north while map rotates
- Glowing effect matches accent color
- Positioned above the circular minimap

#### 🎯 Persistent Rotation
- Map rotation now persists - no longer resets to north
- Last rotation angle is maintained
- Smooth continuous rotation as you turn

#### ⚡ Ultra-Smooth Movement
- Significantly increased rotation smoothness (from 0.3 to 0.15 factor)
- Extended CSS transition time (0.8s for ultra-smooth rotation)
- Separate smoothing for movement vs rotation
- Eliminated all jittering

#### ⚙️ Smoothness Controls
Added two new settings sliders:

**Movement Smoothness** (0.1 - 1.0)
- Default: 0.40
- Lower values = smoother but slower response
- Higher values = more responsive but less smooth

**Rotation Smoothness** (0.05 - 0.5)
- Default: 0.15
- Lower values = buttery smooth rotation
- Higher values = faster rotation response

### Technical Changes

**JavaScript (`app.js`)**
- Split `smoothingFactor` into `movementSmoothness` and `rotationSmoothness`
- Added settings persistence for both smoothness parameters
- North indicator rotation synchronized with map rotation
- Removed rotation reset on toggle disable

**CSS (`styles.css`)**
- Added `#north-indicator` styling with glow effect
- Increased map rotation transition to 0.8s
- Added 0.5s transition for north indicator
- Smooth cubic-bezier easing functions

**HTML (`index.html`)**
- Added north indicator SVG element
- Added movement smoothness slider
- Added rotation smoothness slider
- Helpful hints for each smoothness control

### How to Use

1. **North Indicator**: Always shows where north is, even when map rotates
2. **Adjust Movement**: Settings → Movement Smoothness (lower = smoother)
3. **Adjust Rotation**: Settings → Rotation Smoothness (lower = smoother)
4. **Persistent Rotation**: Map maintains rotation angle between sessions

### Recommended Settings

**For Smoothest Experience:**
- Movement Smoothness: 0.20 - 0.30
- Rotation Smoothness: 0.10 - 0.15
- GPS Interval: 0.1s

**For Most Responsive:**
- Movement Smoothness: 0.60 - 0.80
- Rotation Smoothness: 0.30 - 0.40
- GPS Interval: 0.1s

---

## Version 1.0 - Initial Release

### Core Features
- Three NFS themes (Heat, Most Wanted, Underground)
- Real-time GPS tracking
- Rotating minimap with centered car
- Speed display, street names, trail history
- 7 accent colors
- Progressive Web App with offline support
- Comprehensive settings panel
