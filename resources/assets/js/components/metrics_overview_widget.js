(function() {

    angular.module('BuscaAtivaEscolar').directive('metricsOverview', function(moment, Platform, Reports, Report, Charts, Identity) {

        function init(scope, element, attrs) {

            var metrics = {};

            function refreshMetrics() {

                if (attrs.ibgeId && attrs.uf) {
                    Report.getStatusCityByCountry({ ibge_id: attrs.ibgeId, uf: attrs.uf }, function(data) {
                        metrics = data._data;
                        metrics.cases._alteration = parseInt(metrics.cases._interrupted) + parseInt(metrics.cases._transferred);
                    });
                } else {
                    Report.getStatusCity({ city: Identity.getCurrentUser().tenant.city.name, uf: Identity.getCurrentUser().tenant.city.uf }, function(data) {
                        metrics = data._data;
                        metrics.cases._alteration = parseInt(metrics.cases._interrupted) + parseInt(metrics.cases._transferred);
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