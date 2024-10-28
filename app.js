require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/geometry/Point",
  "esri/Graphic",
  "esri/symbols/IconSymbol3DLayer",
  "esri/symbols/PointSymbol3D",
  "esri/geometry/geometryEngine"
], function(Map, SceneView, Point, Graphic, IconSymbol3DLayer, PointSymbol3D, geometryEngine) {
  const map = new Map({
    basemap: "topo-vector",
    ground: "world-elevation"
  });

  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: { latitude: 0, longitude: 0, z: 10000 },
      tilt: 80
    }
  });

  // Define the custom marker symbol
  const planeSymbol = new PointSymbol3D({
    symbolLayers: [
      new IconSymbol3DLayer({
        resource: { href: "plane_1.png" },
        size: 30
      })
    ]
  });

  // Create a graphic to represent the user's position
  const planeGraphic = new Graphic({
    geometry: new Point({ latitude: 0, longitude: 0, z: 1000 }),
    symbol: planeSymbol
  });
  view.graphics.add(planeGraphic);

  let currentZoom = view.camera.position.z; // Initialize current zoom
  let lastPosition = null; // To hold the last known position

  // Event listener to update current zoom when user changes zoom level
  view.watch("zoom", function() {
    currentZoom = view.zoom; // Update current zoom level
  });

  function calculateBearing(start, end) {
    const lat1 = start.latitude * Math.PI / 180;
    const lon1 = start.longitude * Math.PI / 180;
    const lat2 = end.latitude * Math.PI / 180;
    const lon2 = end.longitude * Math.PI / 180;

    const dLon = lon2 - lon1;

    const x = Math.sin(dLon) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let initialBearing = Math.atan2(x, y) * 180 / Math.PI;
    initialBearing = (initialBearing + 360) % 360; // Normalize to 0-360

    return initialBearing;
  }

  function updateLocation(latitude, longitude, altitude) {
    console.log("Updating location:", latitude, longitude, altitude);

    const newLocation = new Point({
      latitude: latitude,
      longitude: longitude,
      z: altitude || 1000
    });

    // Calculate the distance between the current view center and the new location
    const distance = Math.sqrt(
      Math.pow(view.center.latitude - newLocation.latitude, 2) +
      Math.pow(view.center.longitude - newLocation.longitude, 2)
    );

    // Only update if the new location is significantly different
    if (distance > 0.0001) { // Adjust this threshold as needed
      // Update the plane's graphic geometry
      planeGraphic.geometry = newLocation;

      // Update the view center without changing zoom
      view.center = newLocation;

      // Lock the zoom level to the stored value
      view.camera.position.z = currentZoom;

      // Rotate the marker based on the bearing
      if (lastPosition) {
        const bearing = calculateBearing(lastPosition, newLocation);
        // Apply rotation to the marker
        planeSymbol.symbolLayers.getItemAt(0).angle = bearing; // Set rotation
        planeSymbol.symbolLayers.getItemAt(0).depth = 0; // Ensure the depth is set to zero to avoid conflicts
      }

      // Update the last position
      lastPosition = newLocation;
    } else {
      // Just update the graphic position without changing the view center
      planeGraphic.geometry = newLocation;
    }
  }

  // Function to start live tracking
  function startTracking() {
    if (navigator.geolocation) {
      console.log("Geolocation is supported.");

      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, altitude } = position.coords;
          console.log("Position received:", position.coords);
          updateLocation(latitude, longitude, altitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }

  // Call startLiveTracking when needed
  //startLiveTracking();
});
