(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMap', function (moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs) {

            function interleave(map, data){
                var provider = map.getBaseLayer().getProvider();

                // get the style object for the base layer
                var style = provider.getStyle();

                var dataPoints = data.map(function (item) {
                    return new H.clustering.DataPoint(item.latitude, item.longitude);
                });

                // Create a clustering provider with custom options for clusterizing the input
                var clusteredDataProvider = new H.clustering.Provider(dataPoints, {
                    clusteringOptions: {
                        // Maximum radius of the neighbourhood
                        eps: 32,
                        // minimum weight of points required to form a cluster
                        minWeight: 1
                    }
                });

                var changeListener = () => {
                    if (style.getState() === H.map.Style.State.READY) {
                        style.removeEventListener('change', changeListener);

                        // create a provider and a layer that are placed under the buildings layer
                        // objectProvider = new H.map.provider.LocalObjectProvider();
                        objectLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);
                        // add a circle to this provider the circle will appear under the buildings
                        // objectProvider.getRootGroup().addObject(new H.map.Circle(map.getCenter(), 500));
                        // add the layer to the map
                        map.addLayer(objectLayer);

                        // extract buildings from the base layer config
                        // in order to inspect the config calling style.getConfig()
                        buildings = new H.map.Style(style.extractConfig('buildings'));
                        // create the new layer for the buildings
                        buildingsLayer = platform.getOMVService().createLayer(buildings);
                        // add the layer to the map
                        map.addLayer(buildingsLayer);

                        // the default object layer and its objects will remain on top of the buildings layer
                        // map.addObject(new H.map.Marker(dataPoints));
                        // var clusteringLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);
                        //
                        // // To make objects from clustering provder visible,
                        // // we need to add our layer to the map
                        // map.addLayer(clusteringLayer);
                    }
                }

                style.addEventListener('change', changeListener);
            }

            /**
             * Boilerplate map initialization code starts below:
             */

//Step 1: initialize communication with the platform
// In your own code, replace variable window.apikey with your own apikey
            var platform = new H.service.Platform({
                apikey: 'cVhEI2VX0p26k_Rdz_NpbL-zV1eo5rDkTe2BoeJcE9U'
            });
            var defaultLayers = platform.createDefaultLayers();



// Now use the map as required...

// Now use the map as required...

            var refresh = function () {
                // console.log('[widget.cases_map] Loading data...');
                Children.getMap({city_id: attrs.cityId}, function (data) {

                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;
                    // loadMap(data);

                    // console.log("[widget.cases_map] Data loaded: ", data.coordinates, data.center);
                    //Step 2: initialize a map
                    var map = new H.Map(document.getElementById('map'),
                        defaultLayers.vector.normal.map, {
                            center: {lat: data.center.latitude, lng: data.center.longitude},
                            zoom: data.center.zoom + 5,
                            pixelRatio: window.devicePixelRatio || 1
                        });
                    map.getViewModel().setLookAtData({tilt: 45});

// add a resize listener to make sure that the map occupies the whole container
                    window.addEventListener('resize', () => map.getViewPort().resize());

                    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

                    interleave(map, data.coordinates);

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
