(function () {

    angular.module('BuscaAtivaEscolar').directive('casesMap', function (moment, $timeout, uiGmapGoogleMapApi, Identity, Platform, Children, Decorators) {

        function init(scope, element, attrs) {

            scope.refresh = function () {
                console.log('[widget.cases_map] Loading data...');

                Children.getMap({}, function (data) {
                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;

                    console.log("[widget.cases_map] Data loaded: ", data.coordinates, data.center);
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
                scope.showMaps();
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
