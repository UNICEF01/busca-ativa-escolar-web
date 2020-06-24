(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMap', function (moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs) {

            function startClustering(map, data) {

                var dataPoints = data.map(function (item) {
                    return new H.clustering.DataPoint(item.latitude, item.longitude);
                });

                var clusteredDataProvider = new H.clustering.Provider(dataPoints, {
                    clusteringOptions: {
                        eps: 32,
                        minWeight: 2
                    }
                });

                var clusteringLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);

                var locations = data.map(function (item) {
                    return new H.map.Marker({lat: item.latitude, lng: item.longitude});
                });
                var group = new H.map.Group();
                group.addObjects(locations);

                map.getViewModel().setLookAtData({
                    bounds: group.getBoundingBox()
                });

                map.addLayer(clusteringLayer);
            }
            /**
             * Boilerplate map initialization code starts below:
             */

            var platform = new H.service.Platform({
                apikey: 'fgRnSsPLJX3oJiiDsKfxhuuA5EAXrZlTc7P4Oei_vHA'
            });
            var defaultLayers = platform.createDefaultLayers();

            var refresh = function () {
                // console.log('[widget.cases_map] Loading data...');
                Children.getMap({city_id: attrs.cityId}, function (data) {

                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;
                    document.getElementById('map').innerHTML = '';
                    scope.map = new H.Map(document.getElementById('map'),
                        defaultLayers.vector.normal.map, {
                            center: {lat:-13.5013846, lng:-51.901559},
                            zoom: 5,
                            pixelRatio: window.devicePixelRatio || 1
                        });
                    var mapTileService = platform.getMapTileService({
                        // type: 'aerial'
                    });

                    scope.tileLayer = mapTileService.createTileLayer(
                        'maptile',
                        'reduced.day',
                        256,
                        'png8'
                    );
                    scope.map.setBaseLayer(scope.tileLayer);

                    // map.getViewModel().setLookAtData({tilt: 45});

                    window.addEventListener('resize', () => scope.map.getViewPort().resize());

                    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(scope.map));

                    startClustering(scope.map, data.coordinates);

                });
            };

            refresh();

            scope.$watch('objectToInject', function (value) {
                if(value){
                    scope.Obj = value;
                    scope.Obj.invoke = function(city_id){
                        attrs.cityId = city_id;
                        refresh();
                    }
                }
            });
        }

        return {
            link: init,
            scope: {
                /*The object that passed from the cntroller*/
                objectToInject: '='
            },
            replace: true,
            templateUrl: '/views/components/cases_map.html'
        };
    });

})();
