require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/ElevationLayer",
  "esri/layers/SceneLayer"
], function(Map, SceneView, ElevationLayer, SceneLayer) {
  
  // Create a 3D map with the "topo" basemap
  const map = new Map({
    basemap: "topo",
    ground: "world-elevation" // Adds elevation to the ground
  });

  // Create the 3D SceneView
  const view = new SceneView({
    container: "viewDiv", // Reference to the container element
    map: map,             // Reference to the Map object created before the view
    center: [-122.4194, 37.7749], // Longitude, latitude (San Francisco)
    zoom: 12,             // Zoom level
    tilt: 60              // Tilt the view to see 3D buildings
  });

  // Add a 3D building layer (optional)
  const buildingsLayer = new SceneLayer({
    portalItem: {
      id: "f2e9b762544945f390ca4ac3671cfa72" // Sample building layer from ArcGIS
    }
  });

  map.add(buildingsLayer); // Add the layer to the map
});
