require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/geometry/Extent",
    "esri/symbols/TextSymbol"
], function(Map, SceneView, Graphic, GraphicsLayer, Point, Polyline, SimpleMarkerSymbol, SimpleLineSymbol, Extent, TextSymbol) {
    
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
    
    window.loadFlightPath = function(flightData) {
        const pathCoordinates = flightData.map((dataPoint, index) => {
            const point = new Point({
                latitude: dataPoint.latitude,
                longitude: dataPoint.longitude,
                z: dataPoint.altitude
            });
            
            const markerSymbol = new SimpleMarkerSymbol({
                color: [0, 0, 255, 0.6], // Semi-transparent blue
                size: 8,
                outline: { color: "white", width: 2 }
            });
            
            const pointGraphic = new Graphic({
                geometry: point,
                symbol: markerSymbol
            });
            graphicsLayer.add(pointGraphic);
            
            const labelSymbol = new TextSymbol({
                text: `Alt: ${dataPoint.altitude}m`,
                color: "black",
                haloColor: "white",
                haloSize: "1px",
                yoffset: -12,
                font: { size: 10 }
            });
            
            const labelGraphic = new Graphic({
                geometry: point,
                symbol: labelSymbol
            });
            graphicsLayer.add(labelGraphic);
            
            return [dataPoint.longitude, dataPoint.latitude, dataPoint.altitude];
        });
        
        const polyline = new Polyline({
            paths: [pathCoordinates]
        });
        
        const lineSymbol = new SimpleLineSymbol({
            color: [255, 0, 0, 0.7], // Semi-transparent red
            width: 3,
            style: "solid"
        });
        
        const lineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol
        });
        
        graphicsLayer.add(lineGraphic);
        
        if (flightData.length > 0) {
            const firstPoint = flightData[0];
            view.goTo({
                target: [firstPoint.longitude, firstPoint.latitude],
                zoom: 10,
                tilt: 75
            });
        }

        const extent = graphicsLayer.fullExtent;
        view.goTo({
            target: extent,
            easing: "ease-in-out"
        }).catch((error) => {
            if (error.name !== "AbortError") {
                console.error("Error:", error);
            }
        });
    };
});
