require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/TextSymbol"
], function(Map, SceneView, Point, Polyline, Graphic, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, TextSymbol) {

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
    let labelGraphic = null;  // ✅ Define labelGraphic globally
    let animationRunning = false;

    window.loadFlightPath = function(flightData) {
        graphicsLayer.removeAll();
        view.graphics.removeAll(); // ✅ Clear previous labels
        flightPath = flightData;

        if (flightPath.length === 0) {
            console.warn("No flight data provided.");
            return;
        }

        const pathCoordinates = flightData.map(({ latitude, longitude, altitude }) => [longitude, latitude, altitude]);

        // **Draw Flight Path Polyline**
        const polyline = new Polyline({ paths: [pathCoordinates] });

        const lineSymbol = new SimpleLineSymbol({
            color: [0, 255, 0, 0.7], // Green color for the flight path
            width: 3,
            style: "solid"
        });

        const lineGraphic = new Graphic({ geometry: polyline, symbol: lineSymbol });
        graphicsLayer.add(lineGraphic);

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

        graphicsLayer.add(planeGraphic);

        // ✅ Initialize labelGraphic and use view.graphics instead of graphicsLayer
        labelGraphic = new Graphic({
            geometry: new Point({
                longitude: flightPath[0].longitude,
                latitude: flightPath[0].latitude,
                z: flightPath[0].altitude + 500 // Keep label above plane
            }),
            symbol: new TextSymbol({
                text: `Altitude: ${flightPath[0].altitude}m\nSpeed: 0 km/h`,
                color: "black",
                haloColor: "white",
                haloSize: 2,
                font: { size: 14, weight: "bold" },
                verticalAlignment: "bottom",
                yoffset: 15 // Moves text slightly above the plane
            })
        });

        view.graphics.add(labelGraphic); // ✅ Use view.graphics for the label
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

            // ✅ Update Label Graphic Position and Text
            if (labelGraphic) {
                labelGraphic.geometry = new Point({ latitude, longitude, z: altitude + 500 }); // Keep label above
                labelGraphic.symbol = new TextSymbol({
                    text: `Altitude: ${altitude}m\nSpeed: ${speed.toFixed(2)} km/h`,
                    color: "black",
                    haloColor: "white",
                    haloSize: 2,
                    font: { size: 14, weight: "bold" },
                    verticalAlignment: "bottom",
                    yoffset: 15
                });
            }

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
