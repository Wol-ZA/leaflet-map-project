require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView", // Import SceneView for 3D
    "esri/layers/GeoJSONLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/PictureMarkerSymbol",
    "esri/layers/GraphicsLayer"
], function(Map, MapView, SceneView, GeoJSONLayer, Graphic, Point, PictureMarkerSymbol, GraphicsLayer) {
    
    const map = new Map({
        basemap: "topo"
    });

    // Initialize MapView
    let view = new MapView({
        container: "viewDiv",
        map: map,
        center: [22.4617, -33.9646],
        zoom: 12
    });

    let tracking = false;
    let userGraphic;
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    function addUserLocationMarker(position) {
        const coords = [position.coords.longitude, position.coords.latitude];
        const point = new Point({
            longitude: coords[0],
            latitude: coords[1]
        });

        if (!userGraphic) {
            userGraphic = new Graphic({
                geometry: point,
                symbol: new PictureMarkerSymbol({
                    url: "plane_1.png",
                    width: "24px",
                    height: "24px"
                })
            });
            graphicsLayer.add(userGraphic);
        } else {
            userGraphic.geometry = point;
            userGraphic.symbol.rotation = view.rotation; // Keep rotation based on heading
            graphicsLayer.add(userGraphic);
        }

        // Adjust the view to the user location
        view.center = coords;
    }

    // Global functions to start and end tracking
    window.StartTracking = function() {
        if (!tracking) {
            tracking = true; // Set tracking status to true

            // Switch to SceneView for 3D
            view = new SceneView({
                container: "viewDiv", // Reuse the same container
                map: map,
                center: [22.4617, -33.9646],
                zoom: 12
            });

            navigator.geolocation.watchPosition(addUserLocationMarker, function(error) {
                console.error("Geolocation error: ", error);
            }, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            });
        }
    };

    window.EndTracking = function() {
        if (tracking) {
            tracking = false; // Set tracking status to false

            if (userGraphic) {
                graphicsLayer.remove(userGraphic); // Remove the user graphic
                userGraphic = null; // Clear the user graphic reference
            }

            // Optionally switch back to MapView if needed
            view = new MapView({
                container: "viewDiv",
                map: map,
                center: [22.4617, -33.9646],
                zoom: 12
            });
        }
    };

    // Initial layer visibility toggle
    toggleLayerVisibility();
});
