require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/PictureMarkerSymbol",
    "esri/layers/GraphicsLayer"
], function(Map, MapView, GeoJSONLayer, Graphic, Point, PictureMarkerSymbol, GraphicsLayer) {

    const map = new Map({
        basemap: "topo"
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [22.4617, -33.9646],
        zoom: 12
    });

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

    const accfisLayer = createGeoJSONLayer("ACCFIS.geojson", [255, 0, 0, 0.45]);
    const atzCtrLayer = createGeoJSONLayer("ATZ_CTR.geojson", [0, 255, 0, 0.45]);
    const ctaLayer = createGeoJSONLayer("CTA.geojson", [0, 0, 255, 0.45]);
    const tmaLayer = createGeoJSONLayer("TMA.geojson", [255, 255, 0, 0.45]);
    const fadFapFarLayer = createGeoJSONLayer("FAD_FAP_FAR.geojson", [255, 0, 255, 0.45]);

    map.addMany([accfisLayer, atzCtrLayer, ctaLayer, tmaLayer, fadFapFarLayer]);

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

    const sacaaLayer = createIconGeoJSONLayer("SACAA.geojson", "sacaa.png");
    const aerodromeAipLayer = createIconGeoJSONLayer("Aerodrome_AIP.geojson", "aip.png");
    const aerodromeAicLayer = createIconGeoJSONLayer("Aerodrome_AIC.geojson", "aic.png");
    const unlicensedLayer = createIconGeoJSONLayer("Un-Licensed.geojson", "unlicensed.png");
    const atnsLayer = createIconGeoJSONLayer("ATNS.geojson", "atns.png");
    const militaryLayer = createIconGeoJSONLayer("Military.geojson", "military.png");
    const helistopsLayer = createIconGeoJSONLayer("helistops.geojson", "helistops.png");

    map.addMany([sacaaLayer, aerodromeAipLayer, aerodromeAicLayer, unlicensedLayer, atnsLayer, militaryLayer, helistopsLayer]);

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    let userGraphic;
    let trackingActive = false; // Variable to track the state of tracking
    let locationWatchId; // Variable to store the watch position ID

    function addUserLocationMarker(location) {
        const userPoint = {
            type: "point",
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
        };

        const markerSymbol = new PictureMarkerSymbol({
            url: "plane_1.png",
            width: "32px",
            height: "32px"
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

        view.center = userPoint;

        // Optional: Update the map's rotation based on user movement here if needed
    }

    // Start tracking function
    function startTracking() {
        if (!trackingActive && navigator.geolocation) {
            trackingActive = true;
            locationWatchId = navigator.geolocation.watchPosition(addUserLocationMarker, function(error) {
                console.error("Geolocation error: ", error);
            }, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            });
        }
    }

    // Stop tracking function
    function stopTracking() {
        if (trackingActive) {
            trackingActive = false;
            navigator.geolocation.clearWatch(locationWatchId); // Stop watching the location
            graphicsLayer.remove(userGraphic); // Remove the user graphic from the map
            userGraphic = null; // Reset the userGraphic variable
        }
    }

    // Add event listeners to buttons
    document.getElementById("startTrackingBtn").addEventListener("click", startTracking);
    document.getElementById("stopTrackingBtn").addEventListener("click", stopTracking);

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

    // Add event listeners to the checkboxes (unchanged)
    document.getElementById("accfisLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("atzCtrLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("ctaLayerToggle").addEventListener("change", toggleLayerVisibility);
    document.getElementById("tmaLayerToggle").addEventListener("change", toggleLayerVisibility);
   
