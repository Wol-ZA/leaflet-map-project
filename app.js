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

    // Function to create a GeoJSONLayer with a specific color and opacity for polygons
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

    // Define the color for each polygon layer and add to the map
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

    // Define each point layer with its icon and add to the map
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
            
            // Update the map rotation to face the direction of travel
            view.rotation = heading >= 0 ? heading : heading + 360; // Normalize to 0-360 degrees
        }

        // Update lastLocation with the current position
        lastLocation = userPoint;
    }

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

    // Layer toggle control panel visibility
    document.getElementById("toggleLayerButton").addEventListener("click", function() {
        const layerTogglePanel = document.getElementById("layerTogglePanel");
        layerTogglePanel.style.display = layerTogglePanel.style.display === "none" ? "block" : "none";
    });
});
