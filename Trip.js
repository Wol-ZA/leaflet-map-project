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

    // Dynamically calculate and set extent
    const extent = new Extent({
        xmin,
        ymin,
        xmax,
        ymax,
        spatialReference: { wkid: 4326 } // Ensure geographic spatial reference
    });

    view.extent = extent.expand(1.2);
    simulateFlight(flightData);// Add margin for better visualization
};

window.simulateFlight = function(flightData) {
    if (flightData.length === 0) {
        console.warn("No flight data provided.");
        return;
    }

    const planeGraphicLayer = new GraphicsLayer();
    map.add(planeGraphicLayer);

    const planeSymbol = {
        type: "picture-marker",
        url: "plane_1.png",
        width: "32px",
        height: "32px",
    };

    const planeGraphic = new Graphic({
        geometry: new Point({
            longitude: flightData[0].longitude,
            latitude: flightData[0].latitude,
            z: flightData[0].altitude,
            spatialReference: { wkid: 4326 },
        }),
        symbol: planeSymbol,
    });

    planeGraphicLayer.add(planeGraphic);

    // Create the polyline from flight data
    const pathCoordinates = flightData.map((dataPoint) => [
        dataPoint.longitude,
        dataPoint.latitude,
        dataPoint.altitude,
    ]);

    const polyline = new Polyline({
        paths: [pathCoordinates],
    });

    // Length of the polyline
    const pathLength = polyline.paths[0].length;
    let currentIndex = 0; // Start at the beginning of the polyline

    function movePlane() {
        if (currentIndex >= pathLength - 1) {
            console.log("Flight simulation complete.");
            return;
        }

        // Move along the polyline, interpolating position
        const fromPoint = new Point({
            longitude: polyline.paths[0][currentIndex][0],
            latitude: polyline.paths[0][currentIndex][1],
            z: polyline.paths[0][currentIndex][2],
        });
        const toPoint = new Point({
            longitude: polyline.paths[0][currentIndex + 1][0],
            latitude: polyline.paths[0][currentIndex + 1][1],
            z: polyline.paths[0][currentIndex + 1][2],
        });

        const segmentLength = Math.hypot(
            toPoint.longitude - fromPoint.longitude,
            toPoint.latitude - fromPoint.latitude
        );
        const steps = 100; // Number of steps to make smoother movement
        let currentStep = 0;

        const animateStep = () => {
            if (currentStep <= steps) {
                const progress = currentStep / steps;

                const interpolatedLongitude = fromPoint.longitude + (toPoint.longitude - fromPoint.longitude) * progress;
                const interpolatedLatitude = fromPoint.latitude + (toPoint.latitude - fromPoint.latitude) * progress;
                const interpolatedAltitude = fromPoint.z + (toPoint.z - fromPoint.z) * progress;

                // Update plane position
                planeGraphic.geometry = new Point({
                    longitude: interpolatedLongitude,
                    latitude: interpolatedLatitude,
                    z: interpolatedAltitude,
                });

                currentStep++;
                setTimeout(animateStep, 50); // Use timeout to control speed
            } else {
                currentIndex++;
                movePlane(); // Move to the next segment
            }
        };

        animateStep();
    }

    movePlane(); // Start moving the plane
};

});
