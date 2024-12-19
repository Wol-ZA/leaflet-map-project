require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/geometry/Extent"
], function(Map, SceneView, Graphic, GraphicsLayer, Point, Polyline, SimpleMarkerSymbol, SimpleLineSymbol, Extent) {
    
const map = new Map({
        basemap: "topo-vector",
        ground: "world-elevation"
    });

    // Define the extent for South Africa
    const southAfricaExtent = new Extent({
        xmin: 16.0, // minimum longitude
        ymin: -35.0, // minimum latitude
        xmax: 33.0, // maximum longitude
        ymax: -22.0, // maximum latitude
        spatialReference: 4326 // WGS84 spatial reference
    });
    
    const view = new SceneView({
        container: "viewDiv",
        map: map,
        extent: southAfricaExtent, // Set the initial extent to South Africa
        camera: {
            position: { latitude: -31.548, longitude: 24.34, z: 30000 },
            tilt: 75
        }
    });
    
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);
    
window.loadFlightPath = function(flightData) {
    graphicsLayer.removeAll(); // Clear previous graphics

    if (flightData.length === 0) {
        console.warn("No flight data provided.");
        return;
    }

    let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;

    const pathCoordinates = flightData.map((dataPoint) => {
        const { latitude, longitude, altitude } = dataPoint;

        // Update bounds for extent
        xmin = Math.min(xmin, longitude);
        ymin = Math.min(ymin, latitude);
        xmax = Math.max(xmax, longitude);
        ymax = Math.max(ymax, latitude);

        const point = new Point({
            latitude,
            longitude,
            z: altitude
        });

        const markerSymbol = new SimpleMarkerSymbol({
            color: [0, 0, 255, 0.6],
            size: 8,
            outline: { color: "white", width: 2 }
        });

        const pointGraphic = new Graphic({
            geometry: point,
            symbol: markerSymbol
        });
        graphicsLayer.add(pointGraphic);

        // Create a vertical line from each waypoint to the ground
        const verticalLine = new Polyline({
            paths: [
                [longitude, latitude, altitude],
                [longitude, latitude, 0]
            ]
        });

        const verticalLineSymbol = new SimpleLineSymbol({
            color: [0, 0, 0, 0.3],
            width: 1,
            style: "dash"
        });

        const verticalLineGraphic = new Graphic({
            geometry: verticalLine,
            symbol: verticalLineSymbol
        });
        graphicsLayer.add(verticalLineGraphic);

        return [longitude, latitude, altitude];
    });

    const polyline = new Polyline({
        paths: [pathCoordinates]
    });

    const lineSymbol = new SimpleLineSymbol({
        color: [255, 0, 0, 0.7],
        width: 3,
        style: "solid"
    });

    const lineGraphic = new Graphic({
        geometry: polyline,
        symbol: lineSymbol
    });

    graphicsLayer.add(lineGraphic);

    // Dynamically calculate center point and zoom level
    const centerLongitude = (xmin + xmax) / 2;
    const centerLatitude = (ymin + ymax) / 2;

    // Calculate distance between farthest points to determine zoom
    const distance = Math.max(xmax - xmin, ymax - ymin);
    let zoomLevel;

    if (distance < 1) {
        zoomLevel = 12; // Close zoom for small trips
    } else if (distance < 5) {
        zoomLevel = 10; // Medium zoom
    } else if (distance < 20) {
        zoomLevel = 8; // Zoom out for larger trips
    } else if (distance < 100) {
        zoomLevel = 6; // Regional zoom
    } else {
        zoomLevel = 4; // National or larger trips
    }

    view.goTo({
        target: [centerLongitude, centerLatitude],
        zoom: zoomLevel,
        tilt: 50 // Optional tilt for a 3D view
    }).catch((error) => {
        if (error.name !== "AbortError") {
            console.error("Error:", error);
        }
    });
};

});
