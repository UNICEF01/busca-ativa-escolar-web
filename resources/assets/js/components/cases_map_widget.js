(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMap', function ($rootScope, moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs) {


            function synchronizeMaps(firstMap, secondMap) {
                // get view model objects for both maps, view model contains all data and
                // utility functions that're related to map's geo state
                var viewModel1 = firstMap.getViewModel(),
                    viewModel2 = secondMap.getViewModel();

                // set up view change listener on interactive map
                firstMap.addEventListener('mapviewchange', function () {
                    // on every view change take a "snapshot" of a current geo data for
                    // interactive map and set this values to the second, non-interactive, map
                    viewModel2.setLookAtData(viewModel1.getLookAtData());
                });
            }

            function addMarkerToGroup(group, coordinate, html) {
                var marker = new H.map.Marker(coordinate);
                // add custom data to the marker
                marker.setData(html);
                group.addObject(marker);

                group.addEventListener('pointerleave', function (evt) {
                    console.log(evt);
                    if (scope.bubble !== undefined) {
                        scope.bubble.close();
                    }
                }, false);

            }

            function addInfoBubble(map, coordinates) {
                var group = new H.map.Group();

                map.addObject(group);

                // add 'tap' event listener, that opens info bubble, to the group
                scope.bubble = '';

                group.addEventListener('tap', function (evt) {

                    if (scope.bubble) {
                        scope.bubble.close();
                    }

                    // event target is the marker itself, group is a parent event target
                    // for all objects that it contains
                    scope.bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
                        // read custom data
                        content: evt.target.getData()
                    });
                    // show info bubble
                    scope.ui.addBubble(scope.bubble);
                }, false);

                angular.forEach(coordinates, function (value, key) {
                    addMarkerToGroup(group, {lat: value.latitude, lng: value.longitude},
                        '<div style="width: 250px"><a href="/children/view/' + value.id + '">' + value.name + '</a>');
                });

                var markers = document.getElementById("map-markes");
                markers.style.display = "none";
            }


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

                // group.addEventListener('tap', function (evt) {
                //     alert()
                //     var target = evt.target;
                //     // retrieve maximum zoom level
                //     var maxZoom = target.getData().maxZoom;
                //     // get the shape's bounding box and adjust the camera position
                //     map.getViewModel().setLookAtData({
                //         zoom: maxZoom,
                //         bounds: target.getBoundingBox()
                //     });
                // });

                group.addObjects(locations);

                map.getViewModel().setLookAtData({
                    bounds: group.getBoundingBox()
                });

                scope.dataMap = map.getViewModel().getLookAtData();

                map.addLayer(clusteringLayer);
            }

            /**
             * Boilerplate map initialization code starts below:
             */

            var platform = new H.service.Platform({
                apikey: 'fgRnSsPLJX3oJiiDsKfxhuuA5EAXrZlTc7P4Oei_vHA'
            });
            var defaultLayers = platform.createDefaultLayers();
            var defaultLayersSync = platform.createDefaultLayers();


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
                            center: {lat: -13.5013846, lng: -51.901559},
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

                    scope.ui = H.ui.UI.createDefault(scope.map, defaultLayersSync);


                    var mapMarkSync = new H.Map(document.getElementById('map-markes'),
                        defaultLayersSync.vector.normal.map, {
                            center: {lat: -13.5013846, lng: -51.901559},
                            zoom: 5,
                            pixelRatio: window.devicePixelRatio || 1
                        });
                    var mapTileServiceSync = platform.getMapTileService({
                        // type: 'aerial'
                    });

                    scope.tileLayer = mapTileService.createTileLayer(
                        'maptile',
                        'reduced.day',
                        256,
                        'png8'
                    );
                    mapMarkSync.setBaseLayer(scope.tileLayer);

                    window.addEventListener('resize', () => mapMarkSync.getViewPort().resize());

                    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(mapMarkSync));

                    scope.ui = H.ui.UI.createDefault(mapMarkSync, defaultLayersSync);

                    startClustering(scope.map, data.coordinates);
                    addInfoBubble(mapMarkSync, scope.coordinates);
                    synchronizeMaps(scope.map, mapMarkSync);

                });
            };

            refresh();

            scope.$watch('objectToInject', function (value) {
                if (value) {
                    scope.Obj = value;
                    scope.Obj.invoke = function (city_id) {
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
