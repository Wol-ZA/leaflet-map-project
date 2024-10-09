// Initialize the map
const map = L.map('map').setView([-26.2041, 28.0473], 5); // Centered on South Africa

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

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
                    if (iconKey && icons[iconKey]) {
                        return L.marker(latlng, { icon: icons[iconKey] });
                    } else {
                        return L.circleMarker(latlng, {
                            radius: 6,
                            fillColor: color,
                            color: color,
                            fillOpacity: 0.8
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

    // Set a popup for the marker showing info from the geoJsonMarkersWithinRange
    updateMarkerPopup(marker, geoJsonMarkersWithinRange);

    // Update the polyline with the new marker
    updatePolyline();

    // Update the circle position when the marker is dragged
    marker.on('drag', function (e) {
        const newLatLng = e.target.getLatLng();
        circle.setLatLng(newLatLng); // Move the circle with the marker
        updatePolyline(); // Update the polyline when marker is dragged
        
        // Recalculate GeoJSON markers within range
        geoJsonMarkersWithinRange = checkGeoJsonMarkersInRange(newLatLng, marker);
        updateMarkerPopup(marker, geoJsonMarkersWithinRange); // Update popup with new info
    });
}

// Function to update the marker's popup with information about GeoJSON markers in range
function updateMarkerPopup(marker, geoJsonMarkersWithinRange) {
    if (geoJsonMarkersWithinRange.length > 0) {
        const popupContent = geoJsonMarkersWithinRange.map(marker => {
            return `<div>
                        <img src="${marker.iconUrl}" alt="Icon" style="width: 20px; height: 20px;">
                        <span>${marker.description}</span>
                    </div>`;
        }).join('');
        marker.bindPopup(popupContent).openPopup(); // Bind the content to the marker's popup
    } else {
        marker.bindPopup("No GeoJSON markers within range.").openPopup(); // Default message if none found
    }
}


// Function to check if any GeoJSON markers are within the circle
function checkGeoJsonMarkersInRange(centerLatLng, marker) {
    const geoJsonMarkersWithinRange = [];

    // Iterate through each GeoJSON layer to check for markers within the radius
    Object.values(geoJsonLayers).forEach(layer => {
        layer.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                const distance = centerLatLng.distanceTo(layer.getLatLng()); // Distance between points
                if (distance <= radiusInMeters) {
                    const feature = layer.feature;

                    // Debugging: Log the properties of each feature
                    console.log('Feature properties:', feature.properties);

                    // Try to access the Description property
                    const description = feature?.properties?.description || "Unknown"; // Get description

                    // Determine the icon from the geojsonFiles based on the layer name
                    const layerName = feature.properties?.layerName || "Unknown"; // Assuming you set layerName in your GeoJSON properties
                    const iconKey = geojsonFiles.find(geojson => geojson.name === layerName)?.icon;

                    // Get the icon URL based on the iconKey
                    const iconUrl = iconKey ? icons[iconKey].options.iconUrl : '';

                    geoJsonMarkersWithinRange.push({
                        description: description,
                        iconUrl: iconUrl,
                        latlng: layer.getLatLng()
                    });
                }
            }
        });
    });

    if (geoJsonMarkersWithinRange.length > 0) {
        console.log('GeoJSON markers within range:', geoJsonMarkersWithinRange);
    } else {
        console.log('No GeoJSON markers within range.');
    }

    return geoJsonMarkersWithinRange; // Return the array for further processing
}

function gotfromwd(s) {
    alert('Got from windev' + s)
}

// Listen for map click event to add draggable marker and circle
map.on('click', function (e) {
    addDraggableMarkerAndCircle(e.latlng);
});
