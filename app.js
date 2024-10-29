require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer",
    "esri/Graphic"
], function(Map, MapView, GeoJSONLayer, Graphic) {

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

    // Add a plane marker at George Airport
    const georgeAirportPoint = {
        type: "point",
        longitude: 22.3789,
        latitude: -34.0056
    };

    const planeGraphic = new Graphic({
        geometry: georgeAirportPoint,
        symbol: {
            type: "picture-marker",
            url: "plane_1.png",
            width: "32px",
            height: "32px",
            // No angle property to maintain fixed orientation
        }
    });

    // Add the plane marker to the view
    view.graphics.add(planeGraphic);

    // Update the plane's position (if needed)
    function updatePlanePosition() {
        // For this example, we are keeping it at the same position.
        // If you want to simulate movement, update the longitude/latitude accordingly.
        planeGraphic.geometry = {
            type: "point",
            longitude: 22.3789, // Longitude of George Airport
            latitude: -34.0056   // Latitude of George Airport
        };
    }

    // Call the update function to keep the plane in the same location
    setInterval(updatePlanePosition, 1000); // Updates every second

    // Toggle layer control panel visibility
    document.getElementById("toggleLayerButton").addEventListener("click", function() {
        const layerTogglePanel = document.getElementById("layerTogglePanel");
        layerTogglePanel.style.display = layerTogglePanel.style.display === "none" ? "block" : "none";
    });
});
