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

  const planeSymbol = new PointSymbol3D({
    symbolLayers: [
      new IconSymbol3DLayer({
        resource: { href: "plane_1.png" },
        size: 30
      })
    ]
  });

  const planeGraphic = new Graphic({
    geometry: new Point({ latitude: 0, longitude: 0, z: 1000 }),
    symbol: planeSymbol
  });
  view.graphics.add(planeGraphic);

  let currentZoom = view.camera.position.z;
  let lastPosition = null;

  view.watch("zoom", function() {
    currentZoom = view.zoom;
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
    initialBearing = (initialBearing + 360) % 360;

    return initialBearing;
  }

  function updateLocation(latitude, longitude, altitude) {
    console.log("Updating location:", latitude, longitude, altitude);

    const newLocation = new Point({
      latitude: latitude,
      longitude: longitude,
      z: altitude || 1000
    });

    const distance = Math.sqrt(
      Math.pow(view.center.latitude - newLocation.latitude, 2) +
      Math.pow(view.center.longitude - newLocation.longitude, 2)
    );

    if (distance > 0.0001) {
      planeGraphic.geometry = newLocation;
      view.center = newLocation;
      view.camera.position.z = currentZoom;

      if (lastPosition) {
        const bearing = calculateBearing(lastPosition, newLocation);
        planeSymbol.symbolLayers.getItemAt(0).angle = bearing;
        planeSymbol.symbolLayers.getItemAt(0).depth = 0;
      }

      lastPosition = newLocation;
    } else {
      planeGraphic.geometry = newLocation;
    }
  }

  // Expose the tracking function globally
  window.startTracking = function() {
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
  };
});
