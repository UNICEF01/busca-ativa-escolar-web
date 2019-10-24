(function () {

    angular.module('BuscaAtivaEscolar').directive('searchableCasesMap', function (moment, $timeout, uiGmapGoogleMapApi, Utils, Identity, Platform, Children, StaticData) {

        function init(scope, element, attrs) {

            scope.clustererOptions = {
                imagePath: '/images/clusterer/m'
            };

            scope.ctrl = {
                events: {
                    tilesloaded: function (map) {
                        scope.ctrl.map = map;
                    }
                }
            };

            scope.onSearch = function (givenUf, givenCity) {
                console.log("[widget.searchable_cases_map] Searching for: ", givenUf, givenCity);

                var uf = Utils.search(StaticData.getUFs(), function (uf) {
                    return (uf.code === givenUf);
                });

                if (uf) {
                    scope.lookAt(parseFloat(uf.lat), parseFloat(uf.lng), 6);
                }

            };

            scope.refresh = function () {
                console.log('[widget.searchable_cases_map] Loading data...');

                Children.getMap({}, function (data) {
                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;

                    console.log("[widget.searchable_cases_map] Data loaded: ", data.coordinates, data.center);
                });
            };

            scope.onMarkerClick = function (marker, event, coords) {
                console.log('[widget.searchable_cases_map] Marker clicked: ', marker, event, coords);
            };


            scope.reloadMap = function () {
                scope.mapReady = false;
                $timeout(function () {
                    scope.mapReady = true;
                }, 10);
            };

            scope.lookAt = function (lat, lng, zoom) {
                console.log("[widget.searchable_cases_map] Look at @ ", lat, lng, zoom, scope.ctrl);

                scope.ctrl.map.panTo({lat: lat, lng: lng});
                scope.ctrl.map.setZoom(zoom);

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
            replace: true,
            templateUrl: '/views/components/searchable_cases_map.html'
        };
    });

})();
