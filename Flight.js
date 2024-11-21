require([
    "esri/geometry/Circle",
    "esri/geometry/Extent",
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView", // Import SceneView for 3D view
    "esri/layers/GeoJSONLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/PictureMarkerSymbol",
    "esri/layers/GraphicsLayer"
], function(Circle, Extent, Map, MapView, SceneView, GeoJSONLayer, Graphic, Point, PictureMarkerSymbol, GraphicsLayer) {

    // Create the map
 window.map = new Map({
    basemap: "topo-vector"
});

    // Create the MapView centered on George, South Africa
    let view = new MapView({
        container: "viewDiv",
        map: map,
        center: [22.4617, -33.9646],
        zoom: 12,
        ui: { components: [] }
    });

function decimalToRGBA(colorDecimal, alpha) {
    // Convert decimal to hexadecimal and pad with leading zeros if necessary
    const hex = colorDecimal.toString(16).padStart(6, "0");

    // Extract the red, green, and blue components
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return [r, g, b, alpha];
}

window.createGeoJSONLayer = function(url, colorDecimal, alpha) {
    return new GeoJSONLayer({
        url: url,
        renderer: {
            type: "simple",
            symbol: {
                type: "simple-fill",
                color: decimalToRGBA(colorDecimal, alpha),  // Convert decimal to RGBA
                outline: {
                    color: decimalToRGBA(colorDecimal, 1),  // Full opacity for outline
                    width: 2,
                    style: "solid"
                }
            }
        },
        opacity: 0.15
    });
}

 // Function to create a GeoJSONLayer with a specific icon for points
    function createIconGeoJSONLayer(url, iconUrl) {
        return new GeoJSONLayer({
            url: url,
            renderer: {
                type: "simple",
                symbol: {
                    type: "picture-marker",
                    url: iconUrl,
                    width: "24px",
                    height: "24px"
                }
            }
        });
    }

    // Define point layers and add to the map
    const sacaaLayer = createIconGeoJSONLayer("SACAA.geojson", "sacaa.png");
    const aerodromeAipLayer = createIconGeoJSONLayer("Aerodrome_AIP.geojson", "aip.png");
    const aerodromeAicLayer = createIconGeoJSONLayer("Aerodrome_AIC.geojson", "aic.png");
    const unlicensedLayer = createIconGeoJSONLayer("Un-Licensed.geojson", "unlicensed.png");
    const atnsLayer = createIconGeoJSONLayer("ATNS.geojson", "atns.png");
    const militaryLayer = createIconGeoJSONLayer("Military.geojson", "military.png");
    const helistopsLayer = createIconGeoJSONLayer("helistops.geojson", "helistops.png");

    // Add point layers to the map
    map.addMany([sacaaLayer, aerodromeAipLayer, aerodromeAicLayer, unlicensedLayer, atnsLayer, militaryLayer, helistopsLayer]);

    // Create a GraphicsLayer for static graphics
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    // Create a variable to hold the user graphic
    let userGraphic;
    let tracking = false; // Variable to track the status of tracking
    let watchId; // Variable to hold the watch position ID

let isUserInteracting = false;

// Event listeners to detect user interaction on the map
view.on("drag", () => isUserInteracting = true);
view.on("mouse-wheel", () => isUserInteracting = true);
view.on("click", () => isUserInteracting = true);
view.on("pointer-move", () => isUserInteracting = true);

// Reset interaction flag after a delay to allow map updates
setInterval(() => isUserInteracting = false, 3000); // Adjust timing as needed

function addUserLocationMarker(location, heading) {
    const userPoint = {
        type: "point",
        longitude: location[0],
        latitude: location[1]
    };

    const markerSymbol = new PictureMarkerSymbol({
        url: "plane_1.png",
        width: "32px",
        height: "32px",
    });

    if (userGraphic) {
        userGraphic.geometry = userPoint;
    } else {
        userGraphic = new Graphic({
            geometry: userPoint,
            symbol: markerSymbol
        });
        graphicsLayer.add(userGraphic);
    }

    // Adjust heading for map rotation
    const adjustedHeading = (heading + view.rotation) % 360;
    // Create the polyline graphic
    const polylineGraphic = createDirectionalPolyline(location, heading);
    console.log(heading);
    console.log(adjustedHeading);
    // Add or update the polyline graphic on the map
    if (!userGraphic.polylineGraphic) {
        userGraphic.polylineGraphic = polylineGraphic;
        graphicsLayer.add(userGraphic.polylineGraphic);
    } else {
        userGraphic.polylineGraphic.geometry = polylineGraphic.geometry; // Update existing polyline
    }

    // Rotate the map view based on heading

  if (!isUserInteracting) {
        const adjustedHeading = (heading + view.rotation) % 360;
        view.rotation = 360 - adjustedHeading;
          if (typeof heading === "number") {
        view.rotation = 360 - heading;
        }// Rotate the map based on heading
        view.center = userPoint;               // Center map on user location
    }
}

function createDirectionalPolyline(userPoint, heading) {
    const nauticalMilesToMeters = 20 * 1852; // 20 nautical miles in meters
    const earthRadiusMeters = 6371000; // Earth's radius in meters

    // Convert heading to radians
    const headingRadians = heading * (Math.PI / 180);

    // Calculate the endpoint based on distance and heading
    const endLatitude = userPoint[1] + (nauticalMilesToMeters / earthRadiusMeters) * (180 / Math.PI) * Math.cos(headingRadians);
    const endLongitude = userPoint[0] + (nauticalMilesToMeters / earthRadiusMeters) * (180 / Math.PI) * Math.sin(headingRadians) / Math.cos(userPoint[1] * Math.PI / 180);

    // Create the polyline geometry
    const polylineGeometry = {
        type: "polyline",
        paths: [[userPoint[0], userPoint[1]], [endLongitude, endLatitude]]
    };

    // Define the line symbol
    const lineSymbol = {
        type: "simple-line",
        color: [0, 0, 255, 0.5],
        width: 2
    };

    // Return the polyline graphic
    return new Graphic({
        geometry: polylineGeometry,
        symbol: lineSymbol
    });
}

    
    // Function to toggle layer visibility based on checkbox states
    function toggleLayerVisibility() {
        accfisLayer.visible = document.getElementById("accfisLayerToggle").checked;
        atzCtrLayer.visible = document.getElementById("atzCtrLayerToggle").checked;
        ctaLayer.visible = document.getElementById("ctaLayerToggle").checked;
        tmaLayer.visible = document.getElementById("tmaLayerToggle").checked;
        fadFapFarLayer.visible = document.getElementById("fadFapFarLayerToggle").checked;

        sacaaLayer.visible = document.getElementById("sacaaLayerToggle").checked;
        aerodromeAipLayer.visible = document.getElementById("aerodromeAipLayerToggle").checked;
        aerodromeAicLayer.visible = document.getElementById("aerodromeAicLayerToggle").checked;
        unlicensedLayer.visible = document.getElementById("unlicensedLayerToggle").checked;
        atnsLayer.visible = document.getElementById("atnsLayerToggle").checked;
        militaryLayer.visible = document.getElementById("militaryLayerToggle").checked;
        helistopsLayer.visible = document.getElementById("helistopsLayerToggle").checked;
    }

    // Add event listeners to the checkboxes
    document.getElementById("accfisLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("atzCtrLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("ctaLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("tmaLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("fadFapFarLayerToggle").addEventListener("change", toggleLayerVisibility);

    document.getElementById("sacaaLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("aerodromeAipLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("aerodromeAicLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("unlicensedLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("atnsLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("militaryLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("helistopsLayerToggle").addEventListener("change", toggleLayerVisibility);

    // Function to start tracking
window.StartTracking = function() {
    if (!tracking) {
        tracking = true;
        watchId = navigator.geolocation.watchPosition(function(position) {
            if (position && position.coords) {
                const userLocation = [position.coords.longitude, position.coords.latitude];
                const heading = position.coords.heading || 0; // Default to 0 if heading is unavailable
                addUserLocationMarker(userLocation, heading); // Pass heading for rotation
            } else {
                console.error("Position is undefined or does not have coordinates.");
            }
        }, function(error) {
            console.error("Geolocation error: ", error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    }
}



    // Function to stop tracking
window.EndTracking = function() {
    if (tracking) {
        tracking = false; // Set tracking status to false
        
        // Remove the user graphic and the polyline graphic
        if (userGraphic) {
            if (userGraphic.polylineGraphic) {
                graphicsLayer.remove(userGraphic.polylineGraphic); // Remove the polyline
                userGraphic.polylineGraphic = null; // Clear the polyline reference
            }
            graphicsLayer.remove(userGraphic); // Remove the user marker
            userGraphic = null; // Clear the user graphic reference
        }
        
        navigator.geolocation.clearWatch(watchId); // Stop watching the position
        
        // Reset the view without replacing the map container
        view.container = null;
        const mapView = new MapView({
            container: "viewDiv",
            map: map,
            center: [22.4617, -33.9646],
            zoom: 12
        });
        
        view = mapView; // Update the view variable
    }
};


    
// Add markers and handle drag events
window.addMarkersAndDrawLine = function (data) {
    const layerIcons = {
        sacaaLayer: "sacaa.png",
        aerodromeAipLayer: "aip.png",
        aerodromeAicLayer: "aic.png",
        unlicensedLayer: "unlicensed.png",
        atnsLayer: "atns.png",
        militaryLayer: "military.png",
        helistopsLayer: "helistops.png"
    };

    const layers = [
        sacaaLayer,
        aerodromeAipLayer,
        aerodromeAicLayer,
        unlicensedLayer,
        atnsLayer,
        militaryLayer,
        helistopsLayer
    ];

    const draggableGraphicsLayer = new GraphicsLayer({ zIndex: 10 });
    map.add(draggableGraphicsLayer);
    draggableGraphicsLayer.removeAll();

    const polylineCoordinates = [];
    const markerGraphics = [];
    let activeCircleGraphic = null;
    let originalPosition = null; // Variable to track the original position of the marker

    // Create markers
    data.forEach((point, index) => {
        const { latitude, longitude, name, description } = point;
        polylineCoordinates.push([longitude, latitude]);

        const markerUrl = index === 0
            ? "markerstart.png"
            : index === data.length - 1
            ? "markerend.png"
            : "markerdefault.png";

        const markerSymbol = {
            type: "picture-marker",
            url: markerUrl,
            width: "36px",
            height: "36px",
             yoffset: "18px", // Adjust for anchor at bottom
            anchor: "bottom-center"
        };

        const markerGraphic = new Graphic({
            geometry: { type: "point", longitude, latitude },
            symbol: markerSymbol,
            attributes: { name, description }
        });

        draggableGraphicsLayer.add(markerGraphic);
        markerGraphics.push(markerGraphic);
    });

    const polylineGraphic = new Graphic({
        geometry: { type: "polyline", paths: polylineCoordinates },
        symbol: { type: "simple-line", color: [0, 0, 255, 0.5], width: 2 }
    });
    draggableGraphicsLayer.add(polylineGraphic);

    // Custom popup creation
    const customPopup = createPopup();

    function createPopup() {
        const popup = document.createElement("div");
        popup.id = "custom-popup";
        popup.style.position = "absolute";
        popup.style.background = "white";
        popup.style.border = "1px solid #ccc";
        popup.style.padding = "10px";
        popup.style.display = "none";
        popup.style.zIndex = "1000";
        popup.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
        document.body.appendChild(popup);
        return popup;
    }

    // Function to query features and build popup content
function getFeaturesWithinRadius(mapPoint, callback) {
    const pointsWithinRadius = [];

    layers.forEach((layer) => {
        layer.queryFeatures({
            geometry: activeCircleGraphic.geometry,
            spatialRelationship: "intersects",
            returnGeometry: true, // Ensure geometry is returned
            outFields: ["*"]
        }).then((result) => {
            result.features.forEach((feature) => {
                if (feature.geometry) { // Ensure geometry exists
                    const layerName = Object.keys(layerIcons).find(key => layer === eval(key));
                    const iconUrl = layerIcons[layerName];

                    pointsWithinRadius.push({
                        name: feature.attributes.name || "Unknown",
                        description: feature.attributes.description || "No description available",
                        icon: iconUrl,
                        latitude: feature.geometry.latitude,
                        longitude: feature.geometry.longitude
                    });
                } else {
                    console.warn("Feature geometry is null. Skipping:", feature);
                }
            });

            callback(pointsWithinRadius);
        }).catch((error) => {
            console.error("Error querying features:", error);
        });
    });
}

    // Function to generate HTML for the popup
    function generatePopupHTML(content, pointsWithinRadius) {
    const poiTags = pointsWithinRadius
        .map(
            (point) => 
                `
                <span class="poi-tag" data-latitude="${point.latitude}" data-longitude="${point.longitude}">
                    <img src="${point.icon}" alt="${point.name}" style="width: 16px; height: 16px; margin-right: 5px;">
                    ${point.name}
                </span>`
        )
        .join(""); 

    return `
        <h3>Current Location</h3>
        <div class="content">${content}</div>
        <div class="input-group">
            <label>Waypoint Name:</label>
            <input type="text" placeholder="Enter waypoint name">
            <label>Identifier:</label>
            <input type="text" placeholder="Enter identifier">
            <div>
                <button>Create</button>
                <button class="cancel">Cancel</button>
            </div>
        </div>
        <div class="poi-tags">
            ${poiTags}
        </div>`;
}
    let originalPositionMark = null;
    function showCustomPopup(content, screenPoint, pointsWithinRadius) {
        const popupHTML = generatePopupHTML(content, pointsWithinRadius);
        customPopup.innerHTML = popupHTML;

        // Set initial position of the popup
        customPopup.style.left = `${screenPoint.x}px`;
        customPopup.style.top = `${screenPoint.y}px`;
        customPopup.style.display = "block";

        
        // Check if the popup overflows the screen horizontally (right side)
        const popupRect = customPopup.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

customPopup.querySelectorAll(".poi-tag").forEach((tag) => {
    tag.addEventListener("click", (event) => {
        const latitude = parseFloat(tag.dataset.latitude);
        const longitude = parseFloat(tag.dataset.longitude);

        if (view.draggedGraphic) {
            // Set the clicked POI tag's location as the new position
            const newPosition = { type: "point", latitude, longitude };

            // Update the marker's geometry (location)
            view.draggedGraphic.geometry = newPosition;

            // Update the polyline coordinates to reflect the marker's new position
            const index = markerGraphics.indexOf(view.draggedGraphic);
            if (index !== -1) {
                polylineCoordinates[index] = [longitude, latitude];
                polylineGraphic.geometry = { type: "polyline", paths: [...polylineCoordinates] };
            }

            // Clear dragged graphic to allow polyline interactions
            view.draggedGraphic = null;

            // Hide the popup after updating
            hideCustomPopup();
        }
    });
});
        
        // Adjust for horizontal overflow (right side)
        if (popupRect.right > screenWidth) {
            const offsetX = popupRect.right - screenWidth;
            customPopup.style.left = `${screenPoint.x - offsetX - 10}px`; // Adjust 10px for margin
        }

        // Adjust for vertical overflow (bottom side)
        if (popupRect.bottom > screenHeight) {
            const offsetY = popupRect.bottom - screenHeight;
            customPopup.style.top = `${screenPoint.y - offsetY - 10}px`; // Adjust 10px for margin
        }

        // Optionally: Adjust for overflow on the left side (if it's too far left)
        if (popupRect.left < 0) {
            const offsetX = popupRect.left;
            customPopup.style.left = `${screenPoint.x - offsetX + 10}px`; // Adjust 10px for margin
        }

        // Optionally: Adjust for overflow on the top side (if it's too far up)
        if (popupRect.top < 0) {
            const offsetY = popupRect.top;
            customPopup.style.top = `${screenPoint.y - offsetY + 10}px`; // Adjust 10px for margin
        }
    }

    // Helper to hide custom popup
    function hideCustomPopup() {
        customPopup.style.display = "none";
    }

    let isDraggingMarker = false;

    function createCircle(mapPoint) {
        const circleGeometry = new Circle({
            center: mapPoint,
            radius: 37040, // 20 nautical miles in meters
            geodesic: true
        });

        const circleSymbol = {
            type: "simple-fill",
            color: [255, 0, 0, 0.2],
            outline: { color: [255, 0, 0, 0.8], width: 1 }
        };

        return new Graphic({
            geometry: circleGeometry,
            symbol: circleSymbol
        });
    }

    view.on("drag", (event) => {
        const { action } = event;
        const mapPoint = view.toMap({ x: event.x, y: event.y });

 if (action === "start") {
    view.hitTest(event).then((response) => {
        if (response.results.length) {
            const graphic = response.results[0].graphic;
            if (markerGraphics.includes(graphic)) {
                // Clone the geometry to store the original position
                originalPositionMark = graphic.geometry.clone();
                console.log("Original position set:", originalPositionMark);

                // Assign dragged graphic
                view.draggedGraphic = graphic;
                isDraggingMarker = true;

                // Create a visual circle if needed
                activeCircleGraphic = createCircle(mapPoint);
                draggableGraphicsLayer.add(activeCircleGraphic);

                event.stopPropagation();
            }
        }
    });
        } else if (action === "update" && isDraggingMarker && view.draggedGraphic) {
            view.draggedGraphic.geometry = mapPoint;

            const index = markerGraphics.indexOf(view.draggedGraphic);
            if (index !== -1) {
                polylineCoordinates[index] = [mapPoint.longitude, mapPoint.latitude];
                polylineGraphic.geometry = { type: "polyline", paths: [...polylineCoordinates] };
            }

            if (activeCircleGraphic) {
                activeCircleGraphic.geometry = createCircle(mapPoint).geometry;

                getFeaturesWithinRadius(mapPoint, (pointsWithinRadius) => {
                    const content = pointsWithinRadius.map(point => 
                        `<div class="item">
                            <div class="icon">
                                <img src="${point.icon}" alt="${point.name}" style="width: 16px; height: 16px; margin-right: 5px;">
                                ${point.name}
                            </div>
                            <span class="identifier">${point.description}</span>
                        </div>`
                    ).join("");  // Join all the individual HTML strings into one

                    const screenPoint = view.toScreen(mapPoint);
                    showCustomPopup(content, screenPoint, pointsWithinRadius);
                });
            }
            event.stopPropagation();
        } else if (action === "end") {
    isDraggingMarker = false;

    if (activeCircleGraphic) {
        draggableGraphicsLayer.remove(activeCircleGraphic);
        activeCircleGraphic = null;
    }

    // Do not reset view.draggedGraphic immediately
    // Keep it available for the Cancel button logic
    view.draggedGraphic = null;
    console.log("Drag ended. Dragged graphic:", view.draggedGraphic);
}
    });

    // Event listener for Cancel button
 customPopup.addEventListener("click", (event) => {
    if (event.target.classList.contains("cancel")) {
        console.log("Cancel button clicked");

        if (view.draggedGraphic && originalPositionMark) {
            console.log("Resetting marker to:", originalPositionMark);

            // Reset marker position
            view.draggedGraphic.geometry = originalPositionMark.clone();

            // Force a refresh of the graphic
            draggableGraphicsLayer.remove(view.draggedGraphic);
            draggableGraphicsLayer.add(view.draggedGraphic);

            // Reset polyline coordinates
            const index = markerGraphics.indexOf(view.draggedGraphic);
            if (index !== -1) {
                polylineCoordinates[index] = [originalPositionMark.longitude, originalPositionMark.latitude];
                polylineGraphic.geometry = { type: "polyline", paths: [...polylineCoordinates] };
                console.log("Polyline reset");
            }

            // Hide popup
            hideCustomPopup();
        } else {
            console.warn("No dragged graphic or original position found.");
        }
    }
});

customPopup.addEventListener("click", (event) => {
    if (event.target.tagName === "BUTTON" && event.target.textContent.trim() === "Create") {
        console.log("Create button clicked");

        const waypointNameInput = customPopup.querySelector("input[placeholder='Enter waypoint name']");
        const identifierInput = customPopup.querySelector("input[placeholder='Enter identifier']");

        if (waypointNameInput && identifierInput) {
            const waypointName = waypointNameInput.value.trim();
            const identifier = identifierInput.value.trim();

            if (!waypointName || !identifier) {
                alert("Please fill in both the Waypoint Name and Identifier.");
                return;
            }

            if (view.draggedGraphic) {
                // Update the dragged graphic's attributes with new name and identifier
                view.draggedGraphic.attributes.name = waypointName;
                view.draggedGraphic.attributes.description = identifier;

                // Persist its current position as the "original position"
                originalPositionMark = view.draggedGraphic.geometry.clone();
                console.log("New position saved:", originalPositionMark);

                // Optionally update marker symbol to reflect the change
                draggableGraphicsLayer.remove(view.draggedGraphic);
                draggableGraphicsLayer.add(view.draggedGraphic);

                // Update the polyline with the new position
                const index = markerGraphics.indexOf(view.draggedGraphic);
                if (index !== -1) {
                    polylineCoordinates[index] = [
                        originalPositionMark.longitude,
                        originalPositionMark.latitude,
                    ];
                    polylineGraphic.geometry = { type: "polyline", paths: [...polylineCoordinates] };
                    console.log("Polyline updated");
                }

                // Hide the popup after saving
                hideCustomPopup();
            }
        } else {
            console.warn("Input fields not found in popup.");
        }
    }
});    

view.on("click", (event) => {
    if (customPopup.style.display === "block" && view.draggedGraphic && originalPositionMark) {
        console.log("Map clicked: Resetting marker to original position");

        // Reset marker position
        view.draggedGraphic.geometry = originalPositionMark.clone();

        // Force a refresh of the graphic
        draggableGraphicsLayer.remove(view.draggedGraphic);
        draggableGraphicsLayer.add(view.draggedGraphic);

        // Reset polyline coordinates
        const index = markerGraphics.indexOf(view.draggedGraphic);
        if (index !== -1) {
            polylineCoordinates[index] = [originalPositionMark.longitude, originalPositionMark.latitude];
            polylineGraphic.geometry = { type: "polyline", paths: [...polylineCoordinates] };
            console.log("Polyline reset");
        }

        // Hide the popup
        hideCustomPopup();
    }
});

    const hitDetectionPolyline = new Graphic({
    geometry: polylineGraphic.geometry,
    symbol: {
        type: "simple-line",
        color: [0, 0, 0, 0], // Fully transparent line
        width: 20 // Increase the width for hit detection
    }
});
draggableGraphicsLayer.add(hitDetectionPolyline);
    
view.on("click", (event) => {
    view.hitTest(event).then((response) => {
        const graphic = response.results[0]?.graphic;

        if (graphic) {
            if (graphic === hitDetectionPolyline) {
                const clickedPoint = view.toMap(event);
                const segmentIndex = findClosestSegment(clickedPoint, polylineCoordinates);
                if (segmentIndex !== -1) {
                    addMarkerBetween(clickedPoint, segmentIndex);
                }
            } else if (markerGraphics.includes(graphic)) {
                // Handle marker click logic if needed
                console.log("Marker clicked:", graphic);
            }
        } else {
            console.log("No graphic found at click location.");
        }
    });
});

// Function to find the closest segment of the polyline
function findClosestSegment(point, coordinates) {
    let closestIndex = -1;
    let minDistance = Infinity;
    const threshold = 0.002; // Approximate degrees for ~20px, adjust as needed

    for (let i = 0; i < coordinates.length - 1; i++) {
        const [x1, y1] = coordinates[i];
        const [x2, y2] = coordinates[i + 1];
        const distance = distanceToSegment(point, { x1, y1, x2, y2 });

        if (distance < minDistance && distance <= threshold) {
            minDistance = distance;
            closestIndex = i;
        }
    }

    return closestIndex;
}

// Function to compute the distance to a line segment
function distanceToSegment(point, segment) {
    const { x1, y1, x2, y2 } = segment;

    // Vector projection math to find the closest point on the segment
    const dx = x2 - x1;
    const dy = y2 - y1;
    const t = ((point.longitude - x1) * dx + (point.latitude - y1) * dy) / (dx * dx + dy * dy);

    const clampedT = Math.max(0, Math.min(1, t));
    const nearestX = x1 + clampedT * dx;
    const nearestY = y1 + clampedT * dy;

    const distance = Math.sqrt(
        Math.pow(nearestX - point.longitude, 2) + Math.pow(nearestY - point.latitude, 2)
    );
    return distance;
}

// Function to add a marker between two existing ones
function addMarkerBetween(mapPoint, segmentIndex) {
    const newMarkerSymbol = {
       type: "picture-marker",
        url: "markerdefault.png",
        width: "36px",
        height: "36px",
        yoffset: "18px", // Half the height of the marker (moves the anchor point to the bottom)
        anchor: "bottom-center"
    };

    const newMarkerGraphic = new Graphic({
        geometry: { type: "point", longitude: mapPoint.longitude, latitude: mapPoint.latitude },
        symbol: newMarkerSymbol,
        attributes: { name: "New Marker", description: "Inserted Marker" }
    });

    // Add the new marker graphic to the layer
    draggableGraphicsLayer.add(newMarkerGraphic);

    // Insert the new marker in the correct position
    markerGraphics.splice(segmentIndex + 1, 0, newMarkerGraphic);
    polylineCoordinates.splice(segmentIndex + 1, 0, [mapPoint.longitude, mapPoint.latitude]);

    // Update the polyline geometry
    polylineGraphic.geometry = { type: "polyline", paths: [...polylineCoordinates] };
}
    
};





window.removeMarkersAndLines = function() {
    graphicsLayer.removeAll(); // Access graphicsLayer globally and clear all graphics
};
    
    // Initial layer visibility toggle
    toggleLayerVisibility();
});
