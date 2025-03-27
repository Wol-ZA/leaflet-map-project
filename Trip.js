require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/geometry/Polygon",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/geometry/Extent"
], function(Map, SceneView, Polygon,Graphic, GraphicsLayer, Point, Polyline, SimpleMarkerSymbol,SimpleFillSymbol, SimpleLineSymbol, PictureMarkerSymbol, Extent) {

    const map = new Map({
        basemap: "topo-vector",
        ground: "world-elevation"
    });

    const view = new SceneView({
        container: "viewDiv",
        map: map,
        camera: {
            position: { latitude: -31.548, longitude: 24.34, z: 30000 },
            tilt: 75
        }
    });

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    let flightPath = [];
    let planeGraphic = null;
    let animationRunning = false;

window.loadFlightPath = function(flightData) {
    graphicsLayer.removeAll();
    flightPath = flightData;

    if (flightPath.length === 0) {
        console.warn("No flight data provided.");
        return;
    }

    let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;

    const pathCoordinates = flightData.map(({ latitude, longitude, altitude }) => {
        xmin = Math.min(xmin, longitude);
        ymin = Math.min(ymin, latitude);
        xmax = Math.max(xmax, longitude);
        ymax = Math.max(ymax, latitude);

        return [longitude, latitude, altitude];
    });

    // **Draw Flight Path Polyline**
    const polyline = new Polyline({ paths: [pathCoordinates] });

    const lineSymbol = new SimpleLineSymbol({
        color: [0, 255, 0, 0.7], // Green color for the flight path
        width: 3,
        style: "solid"
    });

    const lineGraphic = new Graphic({
        geometry: polyline,
        symbol: lineSymbol
    });

    graphicsLayer.add(lineGraphic);

    // **Draw Dotted Vertical Lines to Ground**
flightData.forEach(({ latitude, longitude, altitude }) => {
    const verticalLine = new Polyline({
        paths: [
            [[longitude, latitude, altitude], [longitude, latitude, 0]]
        ],
        spatialReference: { wkid: 4326 }
    });

    const dottedLineSymbol = new SimpleLineSymbol({
        color: [255, 0, 0, 0.7], // Red color for visibility
        width: 2,
        style: "dash"
    });

    const verticalLineGraphic = new Graphic({
        geometry: verticalLine,
        symbol: dottedLineSymbol
    });

    graphicsLayer.add(verticalLineGraphic);
});
    
    // **Adjust View to Fit the Flight Path**
    const extent = new Extent({ xmin, ymin, xmax, ymax, spatialReference: { wkid: 4326 } });
    view.extent = extent.expand(1.2);

    // 🔥 Unlock the Camera Controls After Zooming
    setTimeout(() => {
        view.constraints = {
            altitude: {
                min: 10,    // Minimum altitude to prevent camera from going underground
                max: 100000 // Maximum altitude for zooming out
            },
            tilt: {
                max: 180   // Allow full tilting
            }
        };
    }, 1000); // Delay to let the extent load first

   // **Add Plane Symbol as a Dot**
        planeGraphic = new Graphic({
            geometry: new Point({
                longitude: flightPath[0].longitude,
                latitude: flightPath[0].latitude,
                z: flightPath[0].altitude
            }),
            symbol: new SimpleMarkerSymbol({
                color: [0, 0, 255], // Blue color for the dot
                size: 8,
                outline: { color: [255, 255, 255], width: 1 }
            })
        });

        graphicsLayer.add(planeGraphic);

        // **Add Label for Altitude & Speed**
        labelGraphic = new Graphic({
            geometry: new Point({
                longitude: flightPath[0].longitude,
                latitude: flightPath[0].latitude,
                z: flightPath[0].altitude + 500 // Position slightly above the plane
            }),
            symbol: new TextSymbol({
                text: `Altitude: ${flightPath[0].altitude}m\nSpeed: 0 km/h`,
                color: "black",
                haloColor: "white",
                haloSize: 1,
                font: { size: 12, weight: "bold" },
                yoffset: 10 // Moves the text up slightly
            })
        });

        graphicsLayer.add(labelGraphic);
    };

    window.startFlightSimulation = function() {
        if (!flightPath.length || animationRunning) return;

        animationRunning = true;
        let index = 0;
        let lastTimestamp = Date.now();

        function animatePlane() {
            if (index >= flightPath.length) {
                animationRunning = false;
                return;
            }

            const { latitude, longitude, altitude } = flightPath[index];

            // Calculate Speed (if we have at least one previous point)
            let speed = 0;
            if (index > 0) {
                const prev = flightPath[index - 1];
                const distance = getDistance(prev.latitude, prev.longitude, latitude, longitude);
                const timeElapsed = (Date.now() - lastTimestamp) / 1000; // in seconds
                speed = (distance / timeElapsed) * 3.6; // Convert m/s to km/h
                lastTimestamp = Date.now();
            }

            // Update Plane Position
            planeGraphic.geometry = new Point({ latitude, longitude, z: altitude });

            // Update Label Position and Text
            labelGraphic.geometry = new Point({ latitude, longitude, z: altitude + 500 }); // Keep label slightly above
            labelGraphic.symbol.text = `Altitude: ${altitude}m\nSpeed: ${speed.toFixed(2)} km/h`;

            index++;
            setTimeout(animatePlane, 200); // Adjust speed as needed
        }

        animatePlane();
    };

    // Function to calculate distance between two GPS points (Haversine Formula)
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth's radius in meters
        const rad = Math.PI / 180;
        const dLat = (lat2 - lat1) * rad;
        const dLon = (lon2 - lon1) * rad;

        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }
});
