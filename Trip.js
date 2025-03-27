require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol"
], function(Map, SceneView, Point, Polyline, Graphic, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol) {
    
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
    let index = 0;
    let animationTimeout;

    // 🎛 Get the scrollbar
    const flightSlider = document.getElementById("flightSlider");

    // ✅ Load Flight Path
    window.loadFlightPath = function(flightData) {
        graphicsLayer.removeAll();
        flightPath = flightData;
        if (flightPath.length === 0) return;

        flightSlider.max = flightPath.length - 1;
        flightSlider.value = 0;

        const pathCoordinates = flightData.map(({ latitude, longitude, altitude }) => {
            return [longitude, latitude, altitude];
        });

        // **Draw Waypoints**
        flightData.forEach(({ latitude, longitude, altitude }) => {
            const waypointGraphic = new Graphic({
                geometry: new Point({ longitude, latitude, z: altitude }),
                symbol: new SimpleMarkerSymbol({
                    color: [255, 0, 0],
                    size: 6,
                    outline: { color: [255, 255, 255], width: 1 }
                })
            });
            graphicsLayer.add(waypointGraphic);
        });

        // **Draw Vertical Dotted Lines**
        flightData.forEach(({ latitude, longitude, altitude }) => {
            const verticalLine = new Polyline({
                paths: [[[longitude, latitude, altitude], [longitude, latitude, 0]]],
                spatialReference: { wkid: 4326 }
            });

            const verticalLineGraphic = new Graphic({
                geometry: verticalLine,
                symbol: new SimpleLineSymbol({
                    color: [255, 0, 0, 0.7],
                    width: 2,
                    style: "dash"
                })
            });

            graphicsLayer.add(verticalLineGraphic);
        });

        // **Draw Flight Path Polyline**
        const polyline = new Polyline({ paths: [pathCoordinates] });

        const lineGraphic = new Graphic({
            geometry: polyline,
            symbol: new SimpleLineSymbol({
                color: [0, 0, 0, 0.5],
                width: 3,
                style: "solid"
            })
        });

        graphicsLayer.add(lineGraphic);

        // **Add Plane Symbol**
        planeGraphic = new Graphic({
            geometry: new Point({
                longitude: flightPath[0].longitude,
                latitude: flightPath[0].latitude,
                z: flightPath[0].altitude
            }),
            symbol: new SimpleMarkerSymbol({
                color: [0, 0, 255],
                size: 8,
                outline: { color: [255, 255, 255], width: 1 }
            })
        });

        graphicsLayer.add(planeGraphic);
    };

    // 🛑 Play/Pause Control
    function toggleSimulation(play) {
        if (play) {
            if (!animationRunning) {
                animationRunning = true;
                animatePlane();
            }
        } else {
            animationRunning = false;
            clearTimeout(animationTimeout);
        }
    }

    // 🚀 Start Simulation
    window.startFlightSimulation = function() {
        toggleSimulation(true);
    };

    // 🛑 Pause Simulation
    window.pauseFlightSimulation = function() {
        toggleSimulation(false);
    };

    // 🎛 Scrollbar Control (Rewind & Fast Forward)
    flightSlider.addEventListener("input", function() {
        animationRunning = false;
        clearTimeout(animationTimeout);

        index = parseInt(this.value);
        updatePlanePosition(index);
    });

    // 🔄 Jump to a Frame
    function updatePlanePosition(i) {
        if (i >= flightPath.length) return;

        const { latitude, longitude, altitude } = flightPath[i];

        // ✅ Convert Altitude to Feet
        const altitudeFeet = Math.round(altitude * 3.28084);

        // ✅ Update Altitude Display
        document.getElementById("altitudeDisplay").innerText = `Altitude: ${altitudeFeet} ft`;

        // ✅ Update Slider
        flightSlider.value = i;

        // ✅ Move Plane
        planeGraphic.geometry = new Point({ latitude, longitude, z: altitude });
    }

    // 🔄 Animate the Plane
    function animatePlane() {
        if (index >= flightPath.length || !animationRunning) {
            animationRunning = false;
            return;
        }

        updatePlanePosition(index);
        index++;
        flightSlider.value = index; // Update slider position

        animationTimeout = setTimeout(animatePlane, 500);
    }
});
