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

    if (flightData.length === 0) {
        console.warn("No flight data provided.");
        return;
    }

    // Convert flightData to GeoJSON
    const geojson = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: flightData.map(({ longitude, latitude }) => [longitude, latitude])
                }
            }
        ]
    };

    // Generate smooth path using Turf.js
    const smoothed = turf.bezierSpline(geojson.features[0]);
    const smoothPath = smoothed.geometry.coordinates;

    // **Create Polyline with Altitude-Based Colors**
    const polyline = new Polyline({ paths: [smoothPath] });

    const altitudeColor = {
        type: "simple-line",
        color: [255, 255, 255, 0.8], // White by default
        width: 2,
        style: "solid"
    };

    const altitudeGraphic = new Graphic({
        geometry: polyline,
        symbol: altitudeColor
    });

    graphicsLayer.add(altitudeGraphic);

    // **Add Moving Plane Symbol**
    const planeSymbol = new PictureMarkerSymbol({
        url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Airplane_silhouette.png",
        width: "32px",
        height: "32px"
    });

    const planeGraphic = new Graphic({
        geometry: new Point(smoothPath[0]),
        symbol: planeSymbol
    });

    graphicsLayer.add(planeGraphic);

    // **Animate Plane Movement**
    let index = 0;

    const movePlane = () => {
        if (index < smoothPath.length) {
            const [lng, lat, alt] = smoothPath[index];
            planeGraphic.geometry = new Point({ longitude: lng, latitude: lat, z: alt });
            index++;
            requestAnimationFrame(movePlane);
        }
    };

    movePlane();

    // **Focus the Camera to Fit the Flight Path**
    const extent = polyline.extent;
    view.extent = extent.expand(1.2);
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
