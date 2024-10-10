// Initialize the map
const map = L.map('map').setView([-26.2041, 28.0473], 5); // Centered on South Africa

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Create a custom Fly control (a button to start tracking)
const flyControl = L.Control.extend({
    options: {
        position: 'topright' // Position the button on the top right
    },

    onAdd: function (map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

        container.innerHTML = 'Fly';
        container.style.backgroundColor = 'white';
        container.style.width = '50px';
        container.style.height = '30px';
        container.style.lineHeight = '30px';
        container.style.textAlign = 'center';
        container.style.cursor = 'pointer';
        container.style.fontWeight = 'bold';

        // Start tracking on button click
        container.onclick = function (e) {
            L.DomEvent.stopPropagation(e); // Prevent the event from bubbling to the map
            startTracking();
        };

        return container;
    }
});

// Add the Fly button to the map
map.addControl(new flyControl());

// Variables to store the fly marker and the heading (angle)
let flyMarker = null;
let flyAngle = 0;

// Function to start tracking the user's location
function startTracking() {
    // Check if geolocation is available
    if (navigator.geolocation) {
        // Track the user's position in real time
        navigator.geolocation.watchPosition(updateFlyPosition, handleError, {
            enableHighAccuracy: true, // Use GPS if available
            maximumAge: 0,
            timeout: 5000
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Function to update the fly marker's position and heading
function updateFlyPosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const heading = position.coords.heading; // Heading (if available, only on devices with compass)

    // If the marker doesn't exist yet, create it at the current location
    if (!flyMarker) {
        flyMarker = L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: 'plane.png', // Path to the plane image
                iconSize: [50, 50],
                iconAnchor: [25, 25] // Center the icon on the marker
            }),
            draggable: false
        }).addTo(map);

        // Center the map on the current location
        map.setView([lat, lng], 16); // Zoom level 16 to focus on the user

    } else {
        // If marker already exists, just update its position
        flyMarker.setLatLng([lat, lng]);
    }

    // If heading information is available, rotate the marker
    if (heading !== null && heading !== undefined) {
        flyAngle = heading;
        flyMarker.setRotationAngle(flyAngle);
    }

    // Keep the map centered on the current position as you move
    map.panTo([lat, lng]);
}

// Function to handle geolocation errors
function handleError(error) {
    console.warn(`ERROR(${error.code}): ${error.message}`);
}

// Enable rotation for the marker (using leaflet-rotatedmarker.js plugin)
// Make sure you include the 'leaflet-rotatedmarker.js' plugin in your HTML.
L.Marker.include({
    setRotationAngle: function (angle) {
        this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + angle + 'deg)';
    }
});

// Array of geojson file paths, colors, and icons
const geojsonFiles = [
    { file: 'ATZ_CTR.geojson', color: '#FF0000', name: 'ATZ_CTR' },  // Red
    { file: 'CTA.geojson', color: '#00FF00', name: 'CTA' },          // Green
    { file: 'FAD_FAP_FAR.geojson', color: '#0000FF', name: 'FAD_FAP_FAR' }, // Blue
    { file: 'TMA.geojson', color: '#0000FF', name: 'TMA' }, // Blue
    { file: 'ACCFIS.geojson', color: '#FFFF00', name: 'ACCFIS' },    // Yellow
    { file: 'SACAA.geojson', color: '#FF00FF', name: 'SACAA', icon: 'sacaa' }, // Magenta
    { file: 'Un-Licensed.geojson', color: '#00FFFF', name: 'Un-Licensed', icon: 'unlicensed' }, // Cyan
    { file: 'Aerodrome_AIC.geojson', color: '#FFA500', name: 'AIC', icon: 'aic' }, // Orange
    { file: 'Aerodrome_AIP.geojson', color: '#800080', name: 'AIP', icon: 'aip' }, // Purple
    { file: 'ATNS.geojson', color: '#808080', name: 'ATNS', icon: 'atns' }, // Gray
    { file: 'Military.geojson', color: '#000000', name: 'Military', icon: 'military' }, // Black
    { file: 'helistops.geojson', color: '#8B4513', name: 'Helistops', icon: 'helistops' } // SaddleBrown
];

// Define preset icons
const icons = {
    sacaa: L.icon({
        iconUrl: 'sacaa.png',
        iconSize: [13, 13],
        iconAnchor: [7, 5],
    }),
    unlicensed: L.icon({
        iconUrl: 'unlicensed.png',
        iconSize: [13, 13],
        iconAnchor: [7, 5],
    }),
    aic: L.icon({
        iconUrl: 'aic.png',
        iconSize: [13, 13],
        iconAnchor: [7, 5],
    }),
    aip: L.icon({
        iconUrl: 'aip.png',
        iconSize: [13, 13],
        iconAnchor: [7, 5],
    }),
    atns: L.icon({
        iconUrl: 'atns.png',
        iconSize: [13, 13],
        iconAnchor: [7, 5],
    }),
    military: L.icon({
        iconUrl: 'military.png',
        iconSize: [13, 13],
        iconAnchor: [7, 5],
    }),
    helistops: L.icon({
        iconUrl: 'helistops.png',
        iconSize: [13, 13],
        iconAnchor: [7, 5],
    }),
};

// Layer control
let geoJsonLayers = {};  // To store each GeoJSON layer for toggling
let overlays = {};       // For adding to the layer control

// Function to fetch and add GeoJSON data with styles and icons to the map
// Function to fetch and add GeoJSON data with styles and icons to the map
function loadGeojson(file, color, iconKey, layerName) {
    fetch(file)
        .then(response => response.json())
        .then(data => {
            let geoJsonLayer = L.geoJSON(data, {
                // Style for polygons and lines
                style: function (feature) {
                    return {
                        color: color,
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.6
                    };
                },
                // For point features (markers), use the custom icons
                pointToLayer: function (feature, latlng) {
                    // Associate the geojson file name with the marker feature
                    feature.properties.geojsonFile = file; // Store the GeoJSON file name

                    if (iconKey && icons[iconKey]) {
                        return L.marker(latlng, { icon: icons[iconKey], feature: feature }); // Store feature in marker
                    } else {
                        return L.circleMarker(latlng, {
                            radius: 6,
                            fillColor: color,
                            color: color,
                            fillOpacity: 0.8,
                            feature: feature // Store feature in circle marker as well
                        });
                    }
                }
            });

            // Add the GeoJSON layer to the map and store it
            geoJsonLayers[layerName] = geoJsonLayer;
            overlays[layerName] = geoJsonLayer; // Add to overlays for control

            // Add the layer to the map
            geoJsonLayer.addTo(map);

            console.log(`Layer "${layerName}" added to map.`);
        })
        .catch(error => {
            console.error('Error loading the GeoJSON file:', file, error);
        });
}


// Load all the GeoJSON files with their respective colors and icons
geojsonFiles.forEach(layer => loadGeojson(layer.file, layer.color, layer.icon, layer.name));

// Add the layer control to the map after a slight delay
setTimeout(() => {
    L.control.layers(null, overlays).addTo(map);  // Add control with overlay layers
}, 500);

// Convert nautical miles to meters (1 nautical mile = 1852 meters)
const nauticalMileToMeters = 1852;
const radiusInNauticalMiles = 20;
const radiusInMeters = radiusInNauticalMiles * nauticalMileToMeters;

// Function to create a circle around the marker
function createCircle(latlng) {
    return L.circle(latlng, {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.1,
        radius: radiusInMeters,
        weight: 2,
        dashArray: '5, 5' // Dotted line
    }).addTo(map);
}

// Markers and polyline
let markers = [];
let polylines = [];
let circles = [];

// Function to update the polyline based on markers' positions
function updatePolyline() {
    if (polylines.length > 0) {
        polylines.forEach(polyline => map.removeLayer(polyline)); // Remove existing polylines
        polylines = []; // Clear polyline array
    }

    if (markers.length > 1) {
        const latlngs = markers.map(marker => marker.getLatLng());
        const polyline = L.polyline(latlngs, { color: 'blue' }).addTo(map); // Draw a polyline between markers
        polylines.push(polyline);
    }
}

// Function to add a draggable marker and the circle
// Function to add a draggable marker and the circle
function addDraggableMarkerAndCircle(latlng) {
    const marker = L.marker(latlng, { draggable: true }).addTo(map);
    markers.push(marker);

    // Create a circle for the new marker
    const circle = createCircle(latlng);
    circles.push(circle); // Store the circle for future updates

    // Check for markers within the circle when added
    let geoJsonMarkersWithinRange = checkGeoJsonMarkersInRange(latlng, marker);
    updateMarkerPopup(marker, geoJsonMarkersWithinRange);
    updatePolyline();

    // Long press event handling
    let longPressTimeout;

    marker.on('mousedown', function () {
        longPressTimeout = setTimeout(() => {
            // Show a different popup on long press
            const longPressContent = `
                <div class="popup-container">
                    <div class="popup-header">
                        <span class="popup-title">Delete Waypoint?</span>
                    </div>
                    <div class="popup-content">
                        <p>Are you sure you want to delete this waypoint?</p>
                        <button class="popup-button" id="yes-button">Yes</button>
                        <button class="popup-button" id="no-button">No</button>
                    </div>
                </div>
            `;
            marker.bindPopup(longPressContent).openPopup();
        }, 500); // Long press duration (milliseconds)
    });

    marker.on('mouseup', function () {
        clearTimeout(longPressTimeout); // Clear the timeout if the mouse is released before the long press
    });

    marker.on('mouseleave', function () {
        clearTimeout(longPressTimeout); // Clear the timeout if the mouse leaves the marker
    });

    // Setup event listeners for the popup buttons
    marker.on('popupopen', function () {
        const yesButton = document.getElementById('yes-button');
        const noButton = document.getElementById('no-button');

        if (yesButton) {
            yesButton.onclick = function () {
                // Remove the marker from the map
                map.removeLayer(marker);
                // Remove the circle from the map
                const circleIndex = circles.findIndex(circle => {
                    const circleLatLng = circle.getLatLng();
                    return circleLatLng.lat === latlng.lat && circleLatLng.lng === latlng.lng; // Compare lat and lng directly
                });
                if (circleIndex !== -1) {
                    const circleToRemove = circles[circleIndex];
                    map.removeLayer(circleToRemove); // Remove the circle from the map
                    circles.splice(circleIndex, 1); // Remove from the circles array
                }
                // Remove the marker from the markers array
                markers = markers.filter(m => m !== marker);
                // Redraw the polyline
                updatePolyline();
            };
        }

        if (noButton) {
            noButton.onclick = function () {
                // Close the popup if "No" is clicked
                marker.closePopup();
            };
        }
    });

    // Update the circle position when the marker is dragged
    marker.on('drag', function (e) {
        const newLatLng = e.target.getLatLng();
        circle.setLatLng(newLatLng); // Move the circle with the marker
        updatePolyline(); // Update the polyline when the marker is dragged
        
        // Recalculate GeoJSON markers within range
        geoJsonMarkersWithinRange = checkGeoJsonMarkersInRange(newLatLng, marker);
        updateMarkerPopup(marker, geoJsonMarkersWithinRange); // Update popup with new info
    });
}







// Function to update the marker's popup with information about GeoJSON markers in range
function updateMarkerPopup(marker, geoJsonMarkersWithinRange) {
    if (geoJsonMarkersWithinRange.length > 0) {
        const popupContent = `
            <div class="popup-container">
                <div class="popup-header">
                    <span class="popup-title">Current Location</span>
                    <span class="popup-id">ID: EVEMU</span>
                </div>
                <div class="popup-add-waypoint">
                    <span>Add New Waypoint ▼</span>
                </div>
                ${geoJsonMarkersWithinRange.map(marker => `
                    <div class="popup-item">
                        <img src="${marker.iconUrl}" alt="Icon" class="popup-icon">
                        <span class="popup-description">${marker.description}</span>
                    </div>
                `).join('')}
            </div>
        `;
        marker.bindPopup(popupContent).openPopup(); // Bind the content to the marker's popup
    } else {
        marker.bindPopup("No GeoJSON markers within range.").openPopup(); // Default message if none found
    }
}


function checkGeoJsonMarkersInRange(centerLatLng, marker) {
    const geoJsonMarkersWithinRange = [];

    // Iterate through each GeoJSON layer to check for markers within the radius
    Object.values(geoJsonLayers).forEach(layer => {
        layer.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                const distance = centerLatLng.distanceTo(layer.getLatLng());
                if (distance <= radiusInMeters) {
                    const feature = layer.feature;

                    console.log('Feature properties:', feature.properties);

                    // Retrieve the associated GeoJSON file name
                    const geojsonFile = feature.properties.geojsonFile; // Get the GeoJSON file name
                    console.log('Associated GeoJSON file:', geojsonFile);

                    // Find the corresponding geojsonFile in the geojsonFiles array
                    const geojsonConfig = geojsonFiles.find(geojson =>
                        geojson.file.trim().toLowerCase() === geojsonFile.trim().toLowerCase());
                    console.log('Geojson config found:', geojsonConfig);

                    const iconKey = geojsonConfig ? geojsonConfig.icon : null;
                    console.log('Icon key:', iconKey);

                    // Get the icon URL based on the iconKey
                    const iconUrl = iconKey ? (icons[iconKey]?.options.iconUrl || 'default.png') : 'default.png';
                    console.log('Icon URL:', iconUrl);

                    geoJsonMarkersWithinRange.push({
                        description: feature.properties?.description || "Unknown",
                        iconUrl: iconUrl,
                        latlng: layer.getLatLng()
                    });
                }
            }
        });
    });

    console.log('GeoJSON markers within range:', geoJsonMarkersWithinRange);

    return geoJsonMarkersWithinRange; // Return the array for further processing
}






function gotfromwd(s) {
    alert('Got from windev' + s)
}

// Listen for map click event to add draggable marker and circle
map.on('click', function (e) {
    addDraggableMarkerAndCircle(e.latlng);
});
