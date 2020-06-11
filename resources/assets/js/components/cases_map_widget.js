(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMap', function (moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs) {

            scope.markers = [
                { pos: { lat: -15.7797200, lng: -47.9297200 }, draggable: true },
                { pos: { lat: 2.82384, lng: -60.6753 }},
                { pos: { lat: -27.5969, lng:  -48.5495}, draggable: true }
            ];

            scope.mapOptions = {
                height: 640,
                width: 960,
                draggable: true,
                coords: {
                    longitude: 13.338931,
                    latitude: 52.508249
                }
            };

            scope.listeners = {
                click: function(){},
                mousemove: function() {},
                mouseleave: function() {},
                mouseenter: function() {},
                drag: function() {},
                dragstart: function() {},
                dragend: function() {},
                mapviewchange: function() {},
                mapviewchangestart: function() {},
                mapviewchangeend: function() {}
            };

            scope.refresh = function () {
                // console.log('[widget.cases_map] Loading data...');

                Children.getMap({}, function (data) {
                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;

                    // console.log("[widget.cases_map] Data loaded: ", data.coordinates, data.center);
                });
            };

            scope.onMarkerClick = function (marker, event, coords) {
                console.log('[widget.cases_map] Marker clicked: ', marker, event, coords);
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
