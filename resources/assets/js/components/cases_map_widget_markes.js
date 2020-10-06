(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMapMarkes', function ($rootScope, $window, moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs, tabsCtrl) {

            //console.log('Controlador', tabsCtrl);

            /**
             * Creates a new marker and adds it to a group
             * @param {H.map.Group} group       The group holding the new marker
             * @param {H.geo.Point} coordinate  The location of the marker
             * @param {String} html             Data associated with the marker
             */
            function addMarkerToGroup(group, coordinate, html) {
                var marker = new H.map.Marker(coordinate);
                // add custom data to the marker
                marker.setData(html);
                group.addObject(marker);

                marker.addEventListener('pointerleave', function (evt) {
                    scope.bubble.close();
                }, false);

            }

            /**
             * Add two markers showing the position of Liverpool and Manchester City football clubs.
             * Clicking on a marker opens an infobubble which holds HTML content related to the marker.
             * @param  {H.Map} map      A HERE Map instance within the application
             */
            function addInfoBubble(map, coordinates) {
                var group = new H.map.Group();

                map.addObject(group);

                // add 'tap' event listener, that opens info bubble, to the group
                scope.bubble;
                group.addEventListener('tap', function (evt) {
                    // if (scope.bubble !== undefined) {
                    //     scope.bubble.close();
                    // }

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


                // map.getViewModel().setLookAtData({
                //     bounds: group.getBoundingBox()
                // });
            }

            /**
             * Boilerplate map initialization code starts below:
             */

// initialize communication with the platform
// In your own code, replace variable window.apikey with your own apikey
            var platform = new H.service.Platform({
                apikey: 'fgRnSsPLJX3oJiiDsKfxhuuA5EAXrZlTc7P4Oei_vHA'
            });
            var defaultLayers = platform.createDefaultLayers();

            // if(scope.status)

            var refresh = function () {

                Children.getMap({city_id: attrs.cityId}, function (data) {

                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;

                    //console.log(H);

// initialize a map - this map is centered over Europe
                    var map = new H.Map(document.getElementById('map-markes'),
                        defaultLayers.vector.normal.map, {
                            center: {lat: scope.mapCenter.latitude, lng: scope.mapCenter.longitude},
                            zoom: 7,
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
                    map.setBaseLayer(scope.tileLayer);


// add a resize listener to make sure that the map occupies the whole container
                    window.addEventListener('resize', () => map.getViewPort().resize());

// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
                    var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

// create default UI with layers provided by the platform
                    scope.ui = H.ui.UI.createDefault(map, defaultLayers);


// Now use the map as required...
                    addInfoBubble(map, scope.coordinates);

                });
            };

            scope.$watch('status', function (value) {
                refresh();
            });

        }

        return {
            link: init,
            scope: {
                /*The object that passed from the cntroller*/
                objectToInject: '=',
                status: '='
            },
            replace: true,
            templateUrl: '/views/components/cases_map_markes.html'
        };
    });

})();
