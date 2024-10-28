require([ 
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer"
  ], function(Map, MapView, GeoJSONLayer) {

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
    function createPolygonGeoJSONLayer(url, color) {
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

    // Function to create a GeoJSONLayer for points with a specific icon
    function createPointGeoJSONLayer(url, iconUrl) {
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

    // Define the color for each polygon layer and add to the map
    const accfisLayer = createPolygonGeoJSONLayer("ACCFIS.geojson", [255, 0, 0, 0.45]); // Red
    const atzCtrLayer = createPolygonGeoJSONLayer("ATZ_CTR.geojson", [0, 255, 0, 0.45]); // Green
    const ctaLayer = createPolygonGeoJSONLayer("CTA.geojson", [0, 0, 255, 0.45]); // Blue
    const tmaLayer = createPolygonGeoJSONLayer("TMA.geojson", [255, 255, 0, 0.45]); // Yellow
    const fadFapFarLayer = createPolygonGeoJSONLayer("FAD_FAP_FAR.geojson", [255, 0, 255, 0.45]); // Magenta

    // Add polygon layers to the map
    map.addMany([accfisLayer, atzCtrLayer, ctaLayer, tmaLayer, fadFapFarLayer]);

    // Define icons for each point layer
    const pointLayers = [
      { url: "SACAA.geojson", icon: "sacaa.png", toggleId: "sacaaLayerToggle" },
      { url: "Aerodrome_AIP.geojson", icon: "aip.png", toggleId: "aipLayerToggle" },
      { url: "Aerodrome_AIC.geojson", icon: "aic.png", toggleId: "aicLayerToggle" },
      { url: "Un-Licensed.geojson", icon: "unlicensed.png", toggleId: "unlicensedLayerToggle" },
      { url: "ATNS.geojson", icon: "atns.png", toggleId: "atnsLayerToggle" },
      { url: "Military.geojson", icon: "military.png", toggleId: "militaryLayerToggle" },
      { url: "helistops.geojson", icon: "helistops.png", toggleId: "helistopsLayerToggle" }
    ];

    // Create point layers and add to the map
    pointLayers.forEach(layer => {
      const pointLayer = createPointGeoJSONLayer(layer.url, layer.icon);
      map.add(pointLayer);

      // Layer toggle event listener
      document.getElementById(layer.toggleId).addEventListener("change", (e) => {
        pointLayer.visible = e.target.checked;
      });
    });

    // Layer toggle event listeners for polygon layers
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

    // Toggle layer control panel visibility
    function Toggle() {
  const layerTogglePanel = document.getElementById("layerTogglePanel");
  if (layerTogglePanel.style.display === "none" || layerTogglePanel.style.display === "") {
    layerTogglePanel.style.display = "block"; // Show the panel
  } else {
    layerTogglePanel.style.display = "none"; // Hide the panel
  }
}
});




