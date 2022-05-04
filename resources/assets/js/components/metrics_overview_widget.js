(function() {

    angular.module('BuscaAtivaEscolar').directive('metricsOverview', function(Platform, Report, Identity) {

        function init(scope, attrs) {

            var metrics = {};

            function refreshMetrics() {

                if (attrs.ibgeId && attrs.uf) {
                    Report.getStatusCityByCountry({ ibge_id: attrs.ibgeId, uf: attrs.uf }, function(data) {
                        metrics = data._data;
                    });
                } else {
                    Report.getStatusCity({ city: Identity.getCurrentUser().tenant.city.name, uf: Identity.getCurrentUser().tenant.city.uf }, function(data) {
                        metrics = data._data;
                    });
                }

            }

            scope.getMetrics = function() {
                return metrics;
            };

            Platform.whenReady(function() {
                refreshMetrics();
            });

            scope.$watch('objectToInjectInMetrics', function(value) {
                if (value) {
                    scope.Obj = value;
                    scope.Obj.invoke = function(ibgeId) {
                        attrs.ibgeId = ibgeId;
                        refreshMetrics();
                    }
                }
            });

        }

        return {
            link: init,
            scope: {
                objectToInjectInMetrics: '='
            },
            replace: true,
            templateUrl: '/views/components/metrics_overview.html'
        };
    });

})();