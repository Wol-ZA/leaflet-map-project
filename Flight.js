require([
    "esri/geometry/Extent",
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView", // Import SceneView for 3D view
    "esri/layers/GeoJSONLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/PictureMarkerSymbol",
    "esri/layers/GraphicsLayer"
], function(Extent, Map, MapView, SceneView, GeoJSONLayer, Graphic, Point, PictureMarkerSymbol, GraphicsLayer) {

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


    
window.addMarkersAndDrawLine = function (data) {
    // Clear previous graphics
    const draggableGraphicsLayer = new GraphicsLayer({
        zIndex: 10 // Higher zIndex to ensure it stays on top
    });
    map.add(draggableGraphicsLayer);
    draggableGraphicsLayer.removeAll();

    // Array to hold coordinates for the polyline
    const polylineCoordinates = [];

    // Array to store marker graphics for updating positions dynamically
    const markerGraphics = [];

    // Create markers and add them to the map
    data.forEach((point, index) => {
        const { latitude, longitude, name, description } = point;

        // Add to polyline coordinates
        polylineCoordinates.push([longitude, latitude]);

        // Define the point geometry for markers
        const markerPoint = {
            type: "point",
            longitude: longitude,
            latitude: latitude
        };

        // Determine the correct PNG based on position in data
        let markerUrl;
        if (index === 0) {
            markerUrl = "markerstart.png"; // First point
        } else if (index === data.length - 1) {
            markerUrl = "markerend.png"; // Last point
        } else {
            markerUrl = "markerdefault.png"; // Intermediate points
        }

        // Define marker symbol using the selected PNG
        const markerSymbol = {
            type: "picture-marker",
            url: markerUrl,
            width: "36px",
            height: "36px"
        };

        // Create and add marker graphic with popupTemplate
        const markerGraphic = new Graphic({
            geometry: markerPoint,
            symbol: markerSymbol,
            popupTemplate: {
                title: name,
                content: description
            }
        });

        // Add the marker graphic
        draggableGraphicsLayer.add(markerGraphic);
        markerGraphics.push(markerGraphic);

        // Add a circle with a radius of 20 nautical miles
        const circleGeometry = new Circle({
            center: markerPoint,
            radius: 37040, // 20 nautical miles in meters
            geodesic: true // Ensures the radius is accurate on a globe
        });

        const circleSymbol = {
            type: "simple-fill",
            color: [255, 0, 0, 0.2], // Semi-transparent red
            outline: {
                color: [255, 0, 0, 0.8], // Red outline
                width: 1
            }
        };

        const circleGraphic = new Graphic({
            geometry: circleGeometry,
            symbol: circleSymbol
        });

        draggableGraphicsLayer.add(circleGraphic);
    });

    // Create the polyline graphic with the coordinates
    const polylineGraphic = new Graphic({
        geometry: {
            type: "polyline",
            paths: polylineCoordinates
        },
        symbol: {
            type: "simple-line",
            color: [0, 0, 255, 0.5], // Semi-transparent blue
            width: 2
        }
    });

    // Add the polyline graphic to the graphics layer
    draggableGraphicsLayer.add(polylineGraphic);

    // Add drag functionality
    let isDraggingMarker = false;

    view.on("drag", (event) => {
        const { x, y, action } = event;

        // Get the map point from the screen point
        const mapPoint = view.toMap({ x, y });

        if (action === "start") {
            // Check if the user is dragging a marker
            view.hitTest(event).then((response) => {
                if (response.results.length) {
                    const graphic = response.results[0].graphic;

                    if (markerGraphics.includes(graphic)) {
                        // Store the dragged graphic
                        view.draggedGraphic = graphic;
                        isDraggingMarker = true;

                        // Prevent map panning while dragging a marker
                        event.stopPropagation();
                    }
                }
            });
        } else if (action === "update" && isDraggingMarker && view.draggedGraphic) {
            // Update the position of the dragged marker
            view.draggedGraphic.geometry = mapPoint;

            // Update the polyline coordinates
            const index = markerGraphics.indexOf(view.draggedGraphic);
            if (index !== -1) {
                polylineCoordinates[index] = [mapPoint.longitude, mapPoint.latitude];

                // Update the polyline's geometry with the new coordinates
                polylineGraphic.geometry = {
                    type: "polyline",
                    paths: [...polylineCoordinates]
                };

                // Update the circle geometry
                const circleGraphic = draggableGraphicsLayer.graphics.items.find(
                    (g) =>
                        g.geometry.type === "polygon" &&
                        g.geometry.extent.contains(view.draggedGraphic.geometry)
                );

                if (circleGraphic) {
                    circleGraphic.geometry = new Circle({
                        center: mapPoint,
                        radius: 37040,
                        geodesic: true
                    });
                }
            }

            // Prevent map panning while updating the marker position
            event.stopPropagation();
        } else if (action === "end") {
            // End marker dragging
            isDraggingMarker = false;
            view.draggedGraphic = null;
        }
    });

    // Calculate the extent (bounding box) that includes all the markers
    const markerExtent = new Extent({
        xmin: Math.min(...data.map((point) => point.longitude)),
        ymin: Math.min(...data.map((point) => point.latitude)),
        xmax: Math.max(...data.map((point) => point.longitude)),
        ymax: Math.max(...data.map((point) => point.latitude)),
        spatialReference: { wkid: 4326 }
    });

    // Add a small buffer around the extent
    const buffer = 0.1; // Adjust the buffer if needed
    markerExtent.xmin -= buffer;
    markerExtent.ymin -= buffer;
    markerExtent.xmax += buffer;
    markerExtent.ymax += buffer;

    // Pan and zoom to the extent of the markers
    view.goTo({
        extent: markerExtent
    }).then(() => {
        // Optionally, center on the first marker after zooming
        const startMarker = data[0]; // First marker in the data
        const startPoint = new Point({
            longitude: startMarker.longitude,
            latitude: startMarker.latitude
        });

        // Zoom to the extent including all markers
        view.goTo({
            center: startPoint, // Pan to the first marker's coordinates
            scale: 80000 // Adjust the zoom level if needed
        });
    });
};


window.removeMarkersAndLines = function() {
    graphicsLayer.removeAll(); // Access graphicsLayer globally and clear all graphics
};
    
    // Initial layer visibility toggle
    toggleLayerVisibility();
});
