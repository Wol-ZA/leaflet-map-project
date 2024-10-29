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

    let angle = 0; // Initialize angle
    const planeGraphic = new Graphic({
        geometry: georgeAirportPoint,
        symbol: {
            type: "picture-marker",
            url: "plane_1.png",
            width: "32px",
            height: "32px",
            angle: angle // Initial angle
        }
    });

    // Add the plane marker to the view
    view.graphics.add(planeGraphic);

    // Rotate the plane marker 10 degrees every second
    setInterval(() => {
        angle = (angle + 10) % 360; // Increment and wrap angle at 360

        // Update the plane's symbol by creating a new symbol object
        planeGraphic.symbol = {
            type: "picture-marker",
            url: "plane_1.png",
            width: "32px",
            height: "32px",
            angle: angle // Update angle
        };

        // Refresh graphic by removing and adding it again
        view.graphics.remove(planeGraphic);
        view.graphics.add(planeGraphic);

    }, 1000);

    // Toggle layer control panel visibility
    document.getElementById("toggleLayerButton").addEventListener("click", function() {
        const layerTogglePanel = document.getElementById("layerTogglePanel");
        layerTogglePanel.style.display = layerTogglePanel.style.display === "none" ? "block" : "none";
    });
});
