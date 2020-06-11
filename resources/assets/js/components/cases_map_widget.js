(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMap', function (moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs) {

            function startClustering(map, data) {
                // First we need to create an array of DataPoint objects,
                // for the ClusterProvider
                var dataPoints = data.map(function (item) {
                    return new H.clustering.DataPoint(item.latitude, item.longitude);
                });

                // Create a clustering provider with custom options for clusterizing the input
                var clusteredDataProvider = new H.clustering.Provider(dataPoints, {
                    clusteringOptions: {
                        // Maximum radius of the neighbourhood
                        eps: 32,
                        // minimum weight of points required to form a cluster
                        minWeight: 2
                    }
                });

                // Create a layer tha will consume objects from our clustering provider
                var clusteringLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);

                // To make objects from clustering provder visible,
                // we need to add our layer to the map
                map.addLayer(clusteringLayer);
            }

            function loadMap(data) {

                /**
                 * Boilerplate map initialization code starts below:
                 */

// Step 1: initialize communication with the platform
// In your own code, replace variable window.apikey with your own apikey
                var platform = new H.service.Platform({
                    apikey: 'cVhEI2VX0p26k_Rdz_NpbL-zV1eo5rDkTe2BoeJcE9U'
                });


                var defaultLayers = platform.createDefaultLayers();

// Step 2: initialize a map
                var map = new H.Map(document.getElementById('map'), defaultLayers.vector.normal.map, {
                    center: new H.geo.Point(data.center.latitude, data.center.longitude),
                    zoom: data.center.zoom,
                    pixelRatio: window.devicePixelRatio || 1
                });
// add a resize listener to make sure that the map occupies the whole container
                window.addEventListener('resize', () => map.getViewPort().resize());

// Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
                var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));


// Step 4: create the default UI component, for displaying bubbles
                var ui = H.ui.UI.createDefault(map, defaultLayers);

                startClustering(map, data.coordinates);

            }

            scope.refresh = function () {
                // console.log('[widget.cases_map] Loading data...');

                Children.getMap({}, function (data) {
                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;

                    loadMap(data);


                    // console.log("[widget.cases_map] Data loaded: ", data.coordinates, data.center);
                });
            };

            scope.onMarkerClick = function (marker, event, coords) {
                // console.log('[widget.cases_map] Marker clicked: ', marker, event, coords);
            };

            scope.reloadMap = function () {
                scope.mapReady = false;
                $timeout(function () {
                    scope.mapReady = true;
                }, 10);
            };

            scope.isMapReady = function () {
                return scope.mapReady;
            };


            uiGmapGoogleMapApi.then(function (maps) {
                scope.refresh();
            });



        }

        return {
            link: init,
            scope: true,
            replace: true,
            templateUrl: '/views/components/cases_map.html'
        };
    });

})();
