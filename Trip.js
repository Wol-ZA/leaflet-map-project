require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/geometry/Extent"
], function(Map, SceneView, Graphic, GraphicsLayer, Point, Polyline, SimpleMarkerSymbol, SimpleLineSymbol, PictureMarkerSymbol, Extent) {

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

        // **Create Vertical Curtain Line from Point to Ground**
        const curtainLine = new Polyline({
            paths: [
                [longitude, latitude, altitude],
                [longitude, latitude, 0]
            ]
        });

        const curtainSymbol = new SimpleLineSymbol({
            color: [0, 255, 0, 0.2], // Light green transparent line
            width: 2,
            style: "solid"
        });

        const curtainGraphic = new Graphic({
            geometry: curtainLine,
            symbol: curtainSymbol
        });
        graphicsLayer.add(curtainGraphic);

        return [longitude, latitude, altitude];
    });

    // **Draw Flight Path Polyline**
    const polyline = new Polyline({ paths: [pathCoordinates] });

    const lineSymbol = new SimpleLineSymbol({
        color: [0, 255, 0, 0.5], // Semi-transparent green for the flight path
        width: 3,
        style: "solid"
    });

    const lineGraphic = new Graphic({
        geometry: polyline,
        symbol: lineSymbol
    });

    graphicsLayer.add(lineGraphic);

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

    // **Add Plane Symbol for Animation**
    planeGraphic = new Graphic({
        geometry: new Point({
            longitude: flightPath[0].longitude,
            latitude: flightPath[0].latitude,
            z: flightPath[0].altitude
        }),
        symbol: new PictureMarkerSymbol({
            url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Airplane_silhouette.png",
            width: "32px",
            height: "32px",
            angle: 0
        })
    });

    graphicsLayer.add(planeGraphic);
};



    window.startFlightSimulation = function() {
        if (!flightPath.length || animationRunning) return;

        animationRunning = true;
        let index = 0;

        function animatePlane() {
            if (index >= flightPath.length) {
                animationRunning = false;
                return;
            }

            const { latitude, longitude, altitude } = flightPath[index];
            planeGraphic.geometry = new Point({ latitude, longitude, z: altitude });

            index++;
            setTimeout(animatePlane, 200); // Adjust speed as needed
        }

        animatePlane();
    };
});
