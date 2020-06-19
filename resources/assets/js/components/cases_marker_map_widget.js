(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMarkerMap', function (moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs) {


            /**
             * Adds a  draggable marker to the map..
             *
             * @param {H.Map} map                      A HERE Map instance within the
             *                                         application
             * @param {H.mapevents.Behavior} behavior  Behavior implements
             *                                         default interactions for pan/zoom
             */
            function addDraggableMarker(map, behavior) {

                scope.marker = new H.map.Marker({
                    lat: scope.$parent.fields.place_lat,
                    lng: scope.$parent.fields.place_lng,
                }, {
                    // mark the object as volatile for the smooth dragging
                    volatility: true
                });
                // Ensure that the marker can receive drag events
                scope.marker.draggable = true;
                scope.map.addObject(scope.marker);
                scope.map.addEventListener('dragstart', function (ev) {
                    // scope.$parent.fields.place_lat = ev.target.b.lat;
                    // scope.$parent.fields.place_lng = ev.target.b.lng;
                    // scope.$apply();
                    var target = ev.target,
                        pointer = ev.currentPointer;
                    if (target instanceof H.map.Marker) {
                        var targetPosition = map.geoToScreen(target.getGeometry());
                        target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
                        behavior.disable();
                    }
                }, false);

                // re-enable the default draggability of the underlying map
                // when dragging has completed
                scope.map.addEventListener('dragend', function (ev) {
                    scope.$parent.fields.place_lat = ev.target.b.lat;
                    scope.$parent.fields.place_lng = ev.target.b.lng;
                    scope.$apply();
                    var target = ev.target;
                    if (target instanceof H.map.Marker) {
                        behavior.enable();
                    }
                }, false);

                // Listen to the drag event and move the position of the marker
                // as necessary
                scope.map.addEventListener('drag', function (ev) {
                    // scope.$parent.fields.place_lat = ev.target.b.lat;
                    // scope.$parent.fields.place_lng = ev.target.b.lng;
                    // scope.$apply();
                    var target = ev.target,
                        pointer = ev.currentPointer;
                    if (target instanceof H.map.Marker) {
                        target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
                    }
                }, false);
            }

            scope.$watch('fields.place_lat', function (newVal, oldVal) {

                if (newVal != oldVal) {
                    scope.map.removeObject(scope.marker);
                    scope.marker = new H.map.Marker({
                        lat: scope.$parent.fields.place_lat,
                        lng: scope.$parent.fields.place_lng,
                    }, {
                        // mark the object as volatile for the smooth dragging
                        volatility: true
                    });
                    // Ensure that the marker can receive drag events
                    scope.marker.draggable = true;
                    scope.map.addObject(scope.marker);
                    scope.map.setCenter({lat: scope.$parent.fields.place_lat, lng: scope.$parent.fields.place_lng});
                    scope.map.setZoom(18);
                }
            });


            /**
             * Boilerplate map initialization code starts below:
             */

//Step 1: initialize communication with the platform
// In your own code, replace variable window.apikey with your own apikey
            var platform = new H.service.Platform({
                apikey: 'cVhEI2VX0p26k_Rdz_NpbL-zV1eo5rDkTe2BoeJcE9U'
            });

            var defaultLayers = platform.createDefaultLayers();

//Step 2: initialize a map - this map is centered over Boston
            scope.map = new H.Map(document.getElementById('map-marker'),
                defaultLayers.vector.normal.map, {
                    center: {
                        lat: scope.$parent.fields.place_lat,
                        lng: scope.$parent.fields.place_lng
                    },
                    zoom: 18,
                    pixelRatio: window.devicePixelRatio || 1
                });


            //Configuração do mapa
            var mapTileService = platform.getMapTileService({
                type: 'aerial'
            });
            var parameters = {
                lg: 'pt'
            };
            var tileLayer = mapTileService.createTileLayer(
                'maptile',
                'hybrid.day',
                256,
                'png8',
                parameters
            );
            scope.map.setBaseLayer(tileLayer);
// add a resize listener to make sure that the map occupies the whole container
            window.addEventListener('resize', () => scope.map.getViewPort().resize());

//Step 3: make the map interactive
// MapEvents enables the event system
// Behavior implements default interactions for pan/zoom (also on mobile touch environments)
            var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(scope.map));

// Step 4: Create the default UI:
            var ui = H.ui.UI.createDefault(scope.map, defaultLayers, 'pt-BR');

// Add the click event listener.
            addDraggableMarker(scope.map, behavior);


        }

        return {
            link: init,
            scope: true,
            templateUrl: '/views/components/cases_marker_map.html'
        };
    });

})();
