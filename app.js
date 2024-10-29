require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/PictureMarkerSymbol",
    "esri/layers/GraphicsLayer"
], function(Map, MapView, GeoJSONLayer, Graphic, Point, PictureMarkerSymbol, GraphicsLayer) {

    // Create the map
    const map = new Map({
        basemap: "topo"
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
    let lastLocation; // Variable to store the last known location for calculating heading

    // Function to add a marker at the user's current location
    function addUserLocationMarker(location) {
        const userPoint = {
            type: "point",
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
        };

        // Create a marker symbol
        const markerSymbol = new PictureMarkerSymbol({
            url: "plane_1.png", // URL for your marker image
            width: "32px",
            height: "32px"
        });

        // If userGraphic exists, update its position; otherwise create a new one
        if (userGraphic) {
            userGraphic.geometry = userPoint; // Update existing graphic
        } else {
            // Create a new graphic for the user's location
            userGraphic = new Graphic({
                geometry: userPoint,
                symbol: markerSymbol
            });
            graphicsLayer.add(userGraphic); // Add to graphics layer
        }

        // Center the view on the user's location
        view.center = userPoint;

        // Calculate heading if lastLocation is defined
        if (lastLocation) {
            const deltaLongitude = userPoint.longitude - lastLocation.longitude;
            const deltaLatitude = userPoint.latitude - lastLocation.latitude;

            // Calculate heading in degrees
            const heading = Math.atan2(deltaLongitude, deltaLatitude) * (180 / Math.PI);
            view.rotation = heading >= 0 ? heading : heading + 360; // Normalize to 0-360 degrees
        }

        // Update lastLocation with the current position
        lastLocation = userPoint;
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

    // Get the user's current location using the Geolocation API and track updates
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(addUserLocationMarker, function(error) {
            console.error("Geolocation error: ", error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }

    // Initial layer visibility toggle
    toggleLayerVisibility();
});
