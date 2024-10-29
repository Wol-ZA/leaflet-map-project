require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView", // Import SceneView for 3D view
    "esri/layers/GeoJSONLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/PictureMarkerSymbol",
    "esri/layers/GraphicsLayer"
], function(Map, MapView, SceneView, GeoJSONLayer, Graphic, Point, PictureMarkerSymbol, GraphicsLayer) {

    // Create the map
    const map = new Map({
        basemap: "topo-vector",
        ground: "world-elevation"
    });

    // Create the MapView centered on George, South Africa
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [22.4617, -33.9646],
        zoom: 12
    });

    // Function to create the GeoJSONLayer with specified color
    function createGeoJSONLayer(url, color) {
        return new GeoJSONLayer({
            url: url,
            renderer: {
                type: "simple",
                symbol: {
                    type: "simple-fill",
                    color: color,
                    outline: {
                        color: [255, 255, 255, 0.5],
                        width: 1
                    }
                }
            },
            opacity: 0.15
        });
    }

    // Define layers
    const accfisLayer = createGeoJSONLayer("ACCFIS.geojson", [255, 0, 0, 0.45]);
    const atzCtrLayer = createGeoJSONLayer("ATZ_CTR.geojson", [0, 255, 0, 0.45]);
    const ctaLayer = createGeoJSONLayer("CTA.geojson", [0, 0, 255, 0.45]);
    const tmaLayer = createGeoJSONLayer("TMA.geojson", [255, 255, 0, 0.45]);
    const fadFapFarLayer = createGeoJSONLayer("FAD_FAP_FAR.geojson", [255, 0, 255, 0.45]);

    // Add polygon layers to the map
    map.addMany([accfisLayer, atzCtrLayer, ctaLayer, tmaLayer, fadFapFarLayer]);

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

    // Function to add a marker at the user's current location
function addUserLocationMarker(location, heading) {
    const userPoint = {
        type: "point",
        longitude: location[0],
        latitude: location[1]
    };

    const markerSymbol = new PictureMarkerSymbol({
        url: "plane_1.png",
        width: "32px",
        height: "32px"
    });

    // If userGraphic exists, update its position; otherwise, create a new one
    if (userGraphic) {
        userGraphic.geometry = userPoint;
    } else {
        userGraphic = new Graphic({
            geometry: userPoint,
            symbol: markerSymbol
        });
        graphicsLayer.add(userGraphic);
    }

    // Calculate the endpoint of the 20-nautical-mile line based on heading
    const nauticalMilesToDegrees = 20 * 1.852 / 111; // Approx conversion for latitude
    const endpoint = {
        type: "point",
        longitude: location[0] + (nauticalMilesToDegrees * Math.cos(heading * Math.PI / 180)),
        latitude: location[1] + (nauticalMilesToDegrees * Math.sin(heading * Math.PI / 180))
    };

    // Create or update the polyline graphic
    const polyline = {
        type: "polyline",
        paths: [[location[0], location[1]], [endpoint.longitude, endpoint.latitude]]
    };

    const lineSymbol = {
        type: "simple-line",
        color: [0, 0, 255, 0.5],
        width: 2
    };

    if (!userGraphic.polylineGraphic) {
        userGraphic.polylineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol
        });
        graphicsLayer.add(userGraphic.polylineGraphic);
    } else {
        userGraphic.polylineGraphic.geometry = polyline; // Update existing polyline
    }

    // Rotate the map based on heading, if available
    if (typeof heading === "number") {
        view.rotation = 360 - heading;
    }

    view.goTo(userPoint); // Center on user's location
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
            if (userGraphic) {
                graphicsLayer.remove(userGraphic); // Remove the user graphic
                userGraphic = null; // Clear the user graphic reference
            }
            navigator.geolocation.clearWatch(watchId); // Stop watching the position
             view.container = null; // Remove current view
            const mapView = new MapView({
                container: "viewDiv",
                map: map,
                center: [22.4617, -33.9646],
                zoom: 12
            });
            view = mapView; // Update the view variable
        }
    }

    // Initial layer visibility toggle
    toggleLayerVisibility();
});
