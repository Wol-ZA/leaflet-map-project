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
    const accfisLayer = createGeoJSONLayer("ACCFIS.geojson", [255, 0, 0, 0.45]); // Red
    const atzCtrLayer = createGeoJSONLayer("ATZ_CTR.geojson", [0, 255, 0, 0.45]); // Green
    const ctaLayer = createGeoJSONLayer("CTA.geojson", [0, 0, 255, 0.45]); // Blue
    const tmaLayer = createGeoJSONLayer("TMA.geojson", [255, 255, 0, 0.45]); // Yellow
    const fadFapFarLayer = createGeoJSONLayer("FAD_FAP_FAR.geojson", [255, 0, 255, 0.45]); // Magenta

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

    // Layer toggle event listeners for polygons
    document.getElementById("accfisLayerToggle").addEventListener("change", (e) => {
        accfisLayer.visible = e.target.checked;
    });
    document.getElementById("atzCtrLayerToggle").addEventListener("change", (e) => {
        atzCtrLayer.visible = e.target.checked;
    });
    document.getElementById("ctaLayerToggle").addEventListener("change", (e) => {
        ctaLayer.visible = e.target.checked;
    });
    document.getElementById("tmaLayerToggle").addEventListener("change", (e) => {
        tmaLayer.visible = e.target.checked;
    });
    document.getElementById("fadFapFarLayerToggle").addEventListener("change", (e) => {
        fadFapFarLayer.visible = e.target.checked;
    });

    // Layer toggle event listeners for points
    document.getElementById("sacaaLayerToggle").addEventListener("change", (e) => {
        sacaaLayer.visible = e.target.checked;
    });
    document.getElementById("aerodromeAipLayerToggle").addEventListener("change", (e) => {
        aerodromeAipLayer.visible = e.target.checked;
    });
    document.getElementById("aerodromeAicLayerToggle").addEventListener("change", (e) => {
        aerodromeAicLayer.visible = e.target.checked;
    });
    document.getElementById("unlicensedLayerToggle").addEventListener("change", (e) => {
        unlicensedLayer.visible = e.target.checked;
    });
    document.getElementById("atnsLayerToggle").addEventListener("change", (e) => {
        atnsLayer.visible = e.target.checked;
    });
    document.getElementById("militaryLayerToggle").addEventListener("change", (e) => {
        militaryLayer.visible = e.target.checked;
    });
    document.getElementById("helistopsLayerToggle").addEventListener("change", (e) => {
        helistopsLayer.visible = e.target.checked;
    });

    // Add a plane marker at George Airport
    const georgeAirportPoint = {
        type: "point",
        longitude: 22.3789,  // Longitude of George Airport
        latitude: -34.0056   // Latitude of George Airport
    };

    const planeGraphic = new Graphic({
        geometry: georgeAirportPoint,
        symbol: {
            type: "picture-marker",
            url: "plane_1.png",
            width: "32px",
            height: "32px",
            angle: 0 // Starting angle
        }
    });

    // Add the plane marker to the view
    view.graphics.add(planeGraphic);

    // Rotate the plane marker 10 degrees every second
    let angle = 0;
    setInterval(() => {
        angle = (angle + 10) % 360; // Increment and wrap angle at 360
        planeGraphic.symbol.angle = angle;
        view.graphics.remove(planeGraphic); // Remove the old graphic
        view.graphics.add(planeGraphic);    // Add the updated graphic
    }, 1000);

    // Toggle layer control panel visibility
    document.getElementById("toggleLayerButton").addEventListener("click", function() {
        const layerTogglePanel = document.getElementById("layerTogglePanel");
        if (layerTogglePanel.style.display === "none" || layerTogglePanel.style.display === "") {
            layerTogglePanel.style.display = "block"; // Show the panel
        } else {
            layerTogglePanel.style.display = "none"; // Hide the panel
        }
    });
});
