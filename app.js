class NFSMinimap {
    constructor() {
        this.map = null;
        this.currentPosition = null;
        this.currentHeading = 0;
        this.previousHeading = 0;
        this.previousPosition = null;
        this.speed = 0;
        this.gpsWatchId = null;
        this.trailPolyline = null;
        this.trailPoints = [];
        this.updateInterval = null;
        
        
        this.settings = {
            theme: 'heat',
            accentColor: 'cyan',
            gpsInterval: 0.1,
            mapZoom: 17,
            showSpeed: true,
            showStreet: true,
            showCompass: true,
            showTrail: true,
            rotateMap: true,
            speedUnit: 'kmh',
            mapTransitionDuration: 0.5,
            rotationTransitionDuration: 0.8
        };

        this.accentColors = {
            cyan: '#00ffff',
            blue: '#0088ff',
            green: '#00ff00',
            yellow: '#ffff00',
            orange: '#ff8800',
            red: '#ff0000',
            purple: '#ff00ff'
        };

        this.loadSettings();
        this.initMap();
        this.initUI();
        this.startGPSTracking();
        this.drawCarIcon();
    }

    loadSettings() {
        const saved = localStorage.getItem('nfs-minimap-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        this.applyTransitionDurations();
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('nfs-minimap-settings', JSON.stringify(this.settings));
    }

    applySettings() {
        document.body.setAttribute('data-theme', this.settings.theme);
        document.documentElement.style.setProperty('--accent-color', this.accentColors[this.settings.accentColor]);
        
        document.getElementById('speed-display').style.display = this.settings.showSpeed ? 'block' : 'none';
        document.getElementById('street-name').style.display = this.settings.showStreet ? 'block' : 'none';
        document.getElementById('compass-indicator').style.display = this.settings.showCompass ? 'block' : 'none';
        
        if (this.map) {
            this.map.setZoom(this.settings.mapZoom);
        }

        document.getElementById('speed-unit').textContent = this.settings.speedUnit.toUpperCase();
    }

    applyTransitionDurations() {
        const mapEl = document.getElementById('map');
        const northEl = document.getElementById('north-indicator');
        const compassEl = document.getElementById('compass-indicator');
        
        if (mapEl) {
            mapEl.style.transition = `transform ${this.settings.rotationTransitionDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        }
        if (northEl) {
            northEl.style.transition = `transform ${this.settings.rotationTransitionDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        }
        if (compassEl) {
            compassEl.style.transition = `transform ${this.settings.rotationTransitionDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        }
    }

    normalizeAngleForTransition(prevAngle, newAngle) {
        let diff = newAngle - prevAngle;
        
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        
        return prevAngle + diff;
    }

    initMap() {
        this.map = L.map('map', {
            center: [0, 0],
            zoom: this.settings.mapZoom,
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            className: 'map-tiles'
        }).addTo(this.map);

        this.trailPolyline = L.polyline([], {
            color: this.accentColors[this.settings.accentColor],
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1,
            lineJoin: 'round'
        }).addTo(this.map);
    }

    initUI() {
        document.getElementById('settings-btn').addEventListener('click', () => {
            document.getElementById('settings-panel').classList.remove('hidden');
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            document.getElementById('settings-panel').classList.add('hidden');
        });

        document.getElementById('theme-select').value = this.settings.theme;
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.saveSettings();
            this.applySettings();
        });

        document.querySelectorAll('.color-btn').forEach(btn => {
            if (btn.dataset.color === this.settings.accentColor) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.accentColor = btn.dataset.color;
                this.saveSettings();
                this.applySettings();
                this.drawCarIcon();
                if (this.trailPolyline) {
                    this.trailPolyline.setStyle({ color: this.accentColors[this.settings.accentColor] });
                }
            });
        });

        const gpsIntervalSlider = document.getElementById('gps-interval');
        gpsIntervalSlider.value = this.settings.gpsInterval;
        document.getElementById('gps-interval-value').textContent = this.settings.gpsInterval + 's';
        gpsIntervalSlider.addEventListener('input', (e) => {
            this.settings.gpsInterval = parseFloat(e.target.value);
            document.getElementById('gps-interval-value').textContent = this.settings.gpsInterval + 's';
            this.saveSettings();
            this.restartGPSTracking();
        });

        const mapZoomSlider = document.getElementById('map-zoom');
        mapZoomSlider.value = this.settings.mapZoom;
        document.getElementById('map-zoom-value').textContent = this.settings.mapZoom;
        mapZoomSlider.addEventListener('input', (e) => {
            this.settings.mapZoom = parseInt(e.target.value);
            document.getElementById('map-zoom-value').textContent = this.settings.mapZoom;
            this.saveSettings();
            if (this.map) {
                this.map.setZoom(this.settings.mapZoom);
            }
        });

        const mapTransitionSlider = document.getElementById('movement-smoothness');
        mapTransitionSlider.value = this.settings.mapTransitionDuration;
        document.getElementById('movement-smoothness-value').textContent = this.settings.mapTransitionDuration.toFixed(2) + 's';
        mapTransitionSlider.addEventListener('input', (e) => {
            this.settings.mapTransitionDuration = parseFloat(e.target.value);
            document.getElementById('movement-smoothness-value').textContent = this.settings.mapTransitionDuration.toFixed(2) + 's';
            this.saveSettings();
            this.applyTransitionDurations();
        });

        const rotationTransitionSlider = document.getElementById('rotation-smoothness');
        rotationTransitionSlider.value = this.settings.rotationTransitionDuration;
        document.getElementById('rotation-smoothness-value').textContent = this.settings.rotationTransitionDuration.toFixed(2) + 's';
        rotationTransitionSlider.addEventListener('input', (e) => {
            this.settings.rotationTransitionDuration = parseFloat(e.target.value);
            document.getElementById('rotation-smoothness-value').textContent = this.settings.rotationTransitionDuration.toFixed(2) + 's';
            this.saveSettings();
            this.applyTransitionDurations();
        });

        document.getElementById('show-speed').checked = this.settings.showSpeed;
        document.getElementById('show-speed').addEventListener('change', (e) => {
            this.settings.showSpeed = e.target.checked;
            this.saveSettings();
            this.applySettings();
        });

        document.getElementById('show-street').checked = this.settings.showStreet;
        document.getElementById('show-street').addEventListener('change', (e) => {
            this.settings.showStreet = e.target.checked;
            this.saveSettings();
            this.applySettings();
        });

        document.getElementById('show-compass').checked = this.settings.showCompass;
        document.getElementById('show-compass').addEventListener('change', (e) => {
            this.settings.showCompass = e.target.checked;
            this.saveSettings();
            this.applySettings();
        });

        document.getElementById('show-trail').checked = this.settings.showTrail;
        document.getElementById('show-trail').addEventListener('change', (e) => {
            this.settings.showTrail = e.target.checked;
            this.saveSettings();
            if (this.trailPolyline) {
                if (e.target.checked) {
                    this.trailPolyline.addTo(this.map);
                } else {
                    this.map.removeLayer(this.trailPolyline);
                }
            }
        });

        document.getElementById('rotate-map').checked = this.settings.rotateMap;
        document.getElementById('rotate-map').addEventListener('change', (e) => {
            this.settings.rotateMap = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('speed-unit').value = this.settings.speedUnit;
        document.getElementById('speed-unit').addEventListener('change', (e) => {
            this.settings.speedUnit = e.target.value;
            this.saveSettings();
            this.applySettings();
        });

        document.getElementById('cache-area-btn').addEventListener('click', () => {
            this.cacheCurrentArea();
        });

        document.getElementById('reset-settings-btn').addEventListener('click', () => {
            if (confirm('Reset all settings to defaults?')) {
                localStorage.removeItem('nfs-minimap-settings');
                location.reload();
            }
        });
    }

    startGPSTracking() {
        if ('geolocation' in navigator) {
            const options = {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            };

            this.gpsWatchId = navigator.geolocation.watchPosition(
                (position) => this.updatePosition(position),
                (error) => this.handleGPSError(error),
                options
            );

            this.updateInterval = setInterval(() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => this.updatePosition(position),
                    (error) => this.handleGPSError(error),
                    options
                );
            }, this.settings.gpsInterval * 1000);
        } else {
            this.showStatus('GPS not available. Using demo mode.', 'error');
            this.startDemoMode();
        }
    }

    restartGPSTracking() {
        if (this.gpsWatchId) {
            navigator.geolocation.clearWatch(this.gpsWatchId);
        }
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.startGPSTracking();
    }

    updatePosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const newPosition = [lat, lon];

        if (this.currentPosition) {
            this.previousPosition = this.currentPosition;
            this.calculateSpeed(position);
            this.calculateHeading(this.previousPosition, newPosition);
        }

        this.currentPosition = newPosition;
        
        this.map.setView(this.currentPosition, this.settings.mapZoom, { 
            animate: true,
            duration: this.settings.mapTransitionDuration,
            easeLinearity: 0.1
        });

        if (this.settings.showTrail && this.trailPoints.length < 100) {
            this.trailPoints.push(this.currentPosition);
            this.trailPolyline.setLatLngs(this.trailPoints);
        } else if (this.settings.showTrail) {
            this.trailPoints.shift();
            this.trailPoints.push(this.currentPosition);
            this.trailPolyline.setLatLngs(this.trailPoints);
        }

        if (this.settings.rotateMap) {
            const normalizedHeading = this.normalizeAngleForTransition(this.previousHeading, this.currentHeading);
            document.getElementById('map').style.transform = `rotate(${-normalizedHeading}deg)`;
            document.getElementById('north-indicator').style.transform = `translateX(-50%) rotate(${normalizedHeading}deg)`;
            
            const compassEl = document.getElementById('compass-indicator');
            compassEl.style.transform = `rotate(${normalizedHeading}deg) translateY(-190px)`;
            
            this.previousHeading = normalizedHeading;
        }

        if (this.settings.showStreet) {
            this.updateStreetName(lat, lon);
        }
    }

    calculateSpeed(position) {
        if (position.coords.speed !== null && position.coords.speed >= 0) {
            this.speed = position.coords.speed * 3.6;
        } else if (this.previousPosition && this.currentPosition) {
            const distance = this.calculateDistance(
                this.previousPosition[0], this.previousPosition[1],
                this.currentPosition[0], this.currentPosition[1]
            );
            const timeDiff = this.settings.gpsInterval;
            this.speed = (distance / timeDiff) * 3.6;
        }

        let displaySpeed = this.speed;
        if (this.settings.speedUnit === 'mph') {
            displaySpeed = this.speed * 0.621371;
        }

        document.getElementById('speed-value').textContent = Math.round(displaySpeed);
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    calculateHeading(from, to) {
        const lat1 = from[0] * Math.PI / 180;
        const lat2 = to[0] * Math.PI / 180;
        const lon1 = from[1] * Math.PI / 180;
        const lon2 = to[1] * Math.PI / 180;

        const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) -
                  Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        
        this.currentHeading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    async updateStreetName(lat, lon) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'NFS-Minimap/1.0'
                    }
                }
            );
            const data = await response.json();
            
            let streetName = 'Unknown Location';
            if (data.address) {
                streetName = data.address.road || 
                           data.address.suburb || 
                           data.address.city || 
                           data.display_name.split(',')[0];
            }
            
            document.getElementById('street-name').textContent = streetName;
        } catch (error) {
            console.error('Street name lookup failed:', error);
        }
    }

    handleGPSError(error) {
        console.error('GPS Error:', error);
        let message = 'GPS Error: ';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message += 'Permission denied. Please allow location access.';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Position unavailable.';
                break;
            case error.TIMEOUT:
                message += 'Request timeout.';
                break;
            default:
                message += 'Unknown error.';
        }
        this.showStatus(message, 'error');
    }

    drawCarIcon() {
        const canvas = document.getElementById('car-icon');
        const ctx = canvas.getContext('2d');
        const size = 40;
        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);

        const centerX = size / 2;
        const centerY = size / 2;
        const arrowSize = 16;

        ctx.save();
        ctx.translate(centerX, centerY);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, arrowSize);
        gradient.addColorStop(0, this.accentColors[this.settings.accentColor]);
        gradient.addColorStop(1, this.accentColors[this.settings.accentColor] + '80');

        ctx.shadowColor = this.accentColors[this.settings.accentColor];
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.fillStyle = gradient;
        ctx.strokeStyle = this.accentColors[this.settings.accentColor];
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, -arrowSize);
        ctx.lineTo(arrowSize * 0.5, arrowSize * 0.5);
        ctx.lineTo(0, arrowSize * 0.2);
        ctx.lineTo(-arrowSize * 0.5, arrowSize * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    async cacheCurrentArea() {
        this.showStatus('Caching map tiles for offline use...', 'info');
        
        if (!this.currentPosition) {
            this.showStatus('No GPS position available', 'error');
            return;
        }

        const center = this.currentPosition;
        const zoom = this.settings.mapZoom;
        const radius = 0.02;

        const bounds = {
            north: center[0] + radius,
            south: center[0] - radius,
            east: center[1] + radius,
            west: center[1] - radius
        };

        let cachedCount = 0;
        const tilesToCache = [];

        for (let z = Math.max(13, zoom - 2); z <= Math.min(19, zoom + 2); z++) {
            const n = Math.pow(2, z);
            const xtileMin = Math.floor((bounds.west + 180) / 360 * n);
            const xtileMax = Math.floor((bounds.east + 180) / 360 * n);
            const ytileMin = Math.floor((1 - Math.log(Math.tan(bounds.north * Math.PI / 180) + 1 / Math.cos(bounds.north * Math.PI / 180)) / Math.PI) / 2 * n);
            const ytileMax = Math.floor((1 - Math.log(Math.tan(bounds.south * Math.PI / 180) + 1 / Math.cos(bounds.south * Math.PI / 180)) / Math.PI) / 2 * n);

            for (let x = xtileMin; x <= xtileMax; x++) {
                for (let y = ytileMin; y <= ytileMax; y++) {
                    tilesToCache.push({ z, x, y });
                }
            }
        }

        for (const tile of tilesToCache) {
            try {
                const url = `https://a.tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`;
                const response = await fetch(url);
                const blob = await response.blob();
                
                if ('caches' in window) {
                    const cache = await caches.open('map-tiles-v1');
                    await cache.put(url, new Response(blob));
                }
                
                cachedCount++;
                
                if (cachedCount % 10 === 0) {
                    this.showStatus(`Cached ${cachedCount}/${tilesToCache.length} tiles...`, 'info');
                }
            } catch (error) {
                console.error('Failed to cache tile:', error);
            }
        }

        this.showStatus(`Successfully cached ${cachedCount} tiles for offline use!`, 'success');
    }

    startDemoMode() {
        let demoLat = 40.7128;
        let demoLon = -74.0060;
        let demoHeading = 0;

        setInterval(() => {
            demoHeading = (demoHeading + (Math.random() * 30 - 15)) % 360;
            const distance = 0.0001;
            demoLat += distance * Math.cos(demoHeading * Math.PI / 180);
            demoLon += distance * Math.sin(demoHeading * Math.PI / 180);

            this.speed = 40 + Math.random() * 40;
            
            const newPosition = [demoLat, demoLon];
            if (this.currentPosition) {
                this.previousPosition = this.currentPosition;
            }
            this.currentPosition = newPosition;
            this.currentHeading = demoHeading;

            this.map.setView(this.currentPosition, this.settings.mapZoom, { animate: false });

            if (this.settings.showTrail) {
                if (this.trailPoints.length >= 100) {
                    this.trailPoints.shift();
                }
                this.trailPoints.push(newPosition);
                this.trailPolyline.setLatLngs(this.trailPoints);
            }

            if (this.settings.rotateMap) {
                document.getElementById('map').style.transform = `rotate(${-this.currentHeading}deg)`;
            }

            let displaySpeed = this.speed;
            if (this.settings.speedUnit === 'mph') {
                displaySpeed = this.speed * 0.621371;
            }
            document.getElementById('speed-value').textContent = Math.round(displaySpeed);
        }, this.settings.gpsInterval * 1000);
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status-message');
        statusEl.textContent = message;
        statusEl.className = '';
        statusEl.style.borderColor = type === 'error' ? '#ff0000' : 
                                     type === 'success' ? '#00ff00' : 
                                     this.accentColors[this.settings.accentColor];
        
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 3000);
    }
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    new NFSMinimap();
});
