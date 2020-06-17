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
            /**
             * Boilerplate map initialization code starts below:
             */

            var platform = new H.service.Platform({
                apikey: 'cVhEI2VX0p26k_Rdz_NpbL-zV1eo5rDkTe2BoeJcE9U'
            });
            var defaultLayers = platform.createDefaultLayers();

            var refresh = function () {
                // console.log('[widget.cases_map] Loading data...');
                Children.getMap({}, function (data) {
                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;
                    var map = new H.Map(document.getElementById('map'),
                        defaultLayers.vector.normal.map, {
                            center: {lat: data.center.latitude, lng: data.center.longitude},
                            zoom: data.center.zoom + 5,
                            pixelRatio: window.devicePixelRatio || 1
                        });
                    var mapTileService = platform.getMapTileService({
                        // type: 'aerial'
                    });

                    var tileLayer = mapTileService.createTileLayer(
                        'maptile',
                        'reduced.day',
                        256,
                        'png8'
                    );
                    map.setBaseLayer(tileLayer);

                    // map.getViewModel().setLookAtData({tilt: 45});

                    window.addEventListener('resize', () => map.getViewPort().resize());

                    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

                    startClustering(map, data.coordinates);

                });
            };

            refresh();
        }

        return {
            link: init,
            scope: true,
            replace: true,
            templateUrl: '/views/components/cases_map.html'
        };
    });

})();
