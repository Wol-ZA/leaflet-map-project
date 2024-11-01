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
    
    // Create a 3D map with a vector basemap
    const map = new Map({
        basemap: "topo-vector",
        ground: "world-elevation"
    });
    
    // Create a SceneView
    const view = new SceneView({
        container: "viewDiv",
        map: map,
        camera: {
            position: { latitude: -31.548, longitude: 24.34, z: 30000 },
            tilt: 75
        }
    });
    
    // Create a GraphicsLayer to display points and path
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);
    
    // Function to load flight data and draw markers and lines
    window.loadFlightPath = function(flightData) {
        // Prepare the coordinates array for the polyline
        const pathCoordinates = flightData.map((dataPoint) => {
            const point = new Point({
                latitude: dataPoint.latitude,
                longitude: dataPoint.longitude,
                z: dataPoint.altitude
            });
            
            // Add a marker for each point
            const markerSymbol = new SimpleMarkerSymbol({
                color: "blue",
                size: 5,
                outline: { color: "white", width: 1 }
            });
            
            const pointGraphic = new Graphic({
                geometry: point,
                symbol: markerSymbol
            });
            
            graphicsLayer.add(pointGraphic);
            
            // Return coordinates for polyline
            return [dataPoint.longitude, dataPoint.latitude, dataPoint.altitude];
        });
        
        // Create a polyline to connect the points
        const polyline = new Polyline({
            paths: [pathCoordinates]
        });
        
        // Define a simple line symbol for the polyline
        const lineSymbol = new SimpleLineSymbol({
            color: "red",
            width: 2
        });
        
        // Create a Graphic for the polyline and add it to the map
        const lineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol
        });
        
        graphicsLayer.add(lineGraphic);  // Add the polyline to the graphics layer
        
        // Set camera focus to the first point
        if (flightData.length > 0) {
            const firstPoint = flightData[0];
            view.goTo({
                target: [firstPoint.longitude, firstPoint.latitude],
                zoom: 10,  // Adjust zoom level as necessary
                tilt: 75   // Maintain tilt if desired
            });
        }

        // Optionally, set the view to encompass the entire route
        const extent = graphicsLayer.fullExtent; // Get the full extent of the graphics layer
        view.goTo(extent).catch((error) => {
            if (error.name !== "AbortError") {
                console.error("Error:", error);
            }
        });
    };

});
