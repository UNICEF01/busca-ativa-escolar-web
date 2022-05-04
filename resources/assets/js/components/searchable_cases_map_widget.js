(function() {

    angular.module('BuscaAtivaEscolar').directive('searchableCasesMap', function($timeout, Utils, Children, StaticData) {

        function init(scope) {

            scope.clustererOptions = {
                imagePath: '/images/clusterer/m'
            };

            scope.ctrl = {
                events: {
                    tilesloaded: function(map) {
                        scope.ctrl.map = map;
                    }
                }
            };

            scope.onSearch = function(givenUf) {

                var uf = Utils.search(StaticData.getUFs(), function(uf) {
                    return (uf.code === givenUf);
                });

                if (uf) {
                    scope.lookAt(parseFloat(uf.lat), parseFloat(uf.lng), 6);
                }

            };

            scope.refresh = function() {


                Children.getMap({}, function(data) {
                    scope.coordinates = data.coordinates;
                    scope.mapCenter = data.center;
                    scope.mapZoom = data.center.zoom;
                    scope.mapReady = true;


                });
            };

            scope.onMarkerClick = function() {

            };


            scope.reloadMap = function() {
                scope.mapReady = false;
                $timeout(function() {
                    scope.mapReady = true;
                }, 10);
            };

            scope.lookAt = function(lat, lng, zoom) {


                scope.ctrl.map.panTo({ lat: lat, lng: lng });
                scope.ctrl.map.setZoom(zoom);

            };

            scope.isMapReady = function() {
                return scope.mapReady;
            };

        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/components/searchable_cases_map.html'
        };
    });

})();