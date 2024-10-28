require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/SceneLayer"
], function(Map, MapView, SceneLayer) {
  
  // Create a 2D map with the "topo" basemap
  const map = new Map({
    basemap: "topo" // Use a 2D basemap
  });

  // Create the 2D MapView
  const view = new MapView({
    container: "viewDiv",             // Reference to the container element
    map: map,                         // Reference to the Map object created before the view
    center: [22.4617, -33.9646],      // Longitude, latitude (George, South Africa)
    zoom: 12                          // Zoom level
  });

  // Add a 3D building layer as 2D feature (optional)
  const buildingsLayer = new SceneLayer({
    portalItem: {
      id: "f2e9b762544945f390ca4ac3671cfa72" // Sample building layer from ArcGIS
    }
  });

  map.add(buildingsLayer); // Add the layer to the map
});
