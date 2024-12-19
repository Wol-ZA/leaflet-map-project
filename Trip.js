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

    const pathCoordinates = flightData.map((dataPoint) => {
        const point = new Point({
            latitude: dataPoint.latitude,
            longitude: dataPoint.longitude,
            z: dataPoint.altitude
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
                [dataPoint.longitude, dataPoint.latitude, dataPoint.altitude],
                [dataPoint.longitude, dataPoint.latitude, 0]
            ]
        });

        const verticalLineSymbol = new SimpleLineSymbol({
            color: [0, 0, 0, 0.3], // Semi-transparent black
            width: 1,
            style: "dash"
        });

        const verticalLineGraphic = new Graphic({
            geometry: verticalLine,
            symbol: verticalLineSymbol
        });
        graphicsLayer.add(verticalLineGraphic);

        return [dataPoint.longitude, dataPoint.latitude, dataPoint.altitude];
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

    if (graphicsLayer.graphics.length > 0) {
        // Dynamically adjust the view to the extent of the trip
        const fullExtent = graphicsLayer.fullExtent;

        if (fullExtent) {
            view.goTo({
                target: fullExtent.expand(1.2), // Expand the extent slightly for better visibility
                easing: "ease-in-out"
            }).catch((error) => {
                if (error.name !== "AbortError") {
                    console.error("Error:", error);
                }
            });
        } else if (flightData.length > 0) {
            // Fallback to first point if extent calculation fails
            const firstPoint = flightData[0];
            view.goTo({
                target: [firstPoint.longitude, firstPoint.latitude],
                zoom: 10,
                tilt: 75
            });
        }
    }
};
});
