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

// Markers and circle
let markers = [];
let circle = null;

// Function to update the circle's position
function updateCircle(latlng) {
    if (circle) {
        map.removeLayer(circle);
    }
    circle = createCircle(latlng);
}

// Function to add a draggable marker and the circle
function addDraggableMarkerAndCircle(latlng) {
    const marker = L.marker(latlng, { draggable: true }).addTo(map);
    markers.push(marker);

    updateCircle(latlng);

    // Update the circle position when the marker is dragged
    marker.on('drag', function (e) {
        const newLatLng = e.target.getLatLng();
        updateCircle(newLatLng);
        checkGeoJsonMarkersInRange(newLatLng, marker); // Check for markers in the circle
    });

    // Check for markers within the circle when added
    checkGeoJsonMarkersInRange(latlng, marker);

    // Ensure only one marker and one circle
    if (markers.length > 1) {
        const oldMarker = markers.shift(); // Remove the first marker
        map.removeLayer(oldMarker); // Remove from map
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
                    const description = feature?.properties?.Description || "Unknown"; // Get description
                    const iconUrl = feature?.properties?.iconUrl || null; // Assuming iconUrl is stored in properties

                    geoJsonMarkersWithinRange.push({
                        name: description,
                        latlng: layer.getLatLng(),
                        iconUrl: iconUrl
                    });
                }
            }
        });
    });

    // Create the content for the popup
    if (geoJsonMarkersWithinRange.length > 0) {
        let popupContent = "<b>Markers within 20nm:</b><br/>";
        geoJsonMarkersWithinRange.forEach(markerData => {
            const { name, iconUrl } = markerData;
            const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="icon" width="20"/>` : '';
            popupContent += `${iconHtml} ${name}<br/>`;
        });
        marker.bindPopup(popupContent).openPopup();
    } else {
        marker.bindPopup("No markers within 20nm").openPopup();
    }
}

// Listen for map click event to add draggable marker and circle
map.on('click', function (e) {
    addDraggableMarkerAndCircle(e.latlng);
});
