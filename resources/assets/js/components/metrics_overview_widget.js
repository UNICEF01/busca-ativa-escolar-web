(function () {

    angular.module('BuscaAtivaEscolar').directive('metricsOverview', function (moment, Platform, Reports, Report, Charts, Identity) {

        function init(scope, attrs) {

            var metrics = {};

            function refreshMetrics() {

                if (scope.ibgeId && scope.uf) {
                    Report.getStatusCityByCountry({ ibge_id: scope.ibgeId, uf: scope.uf }, function (data) {
                        metrics = data.stats;
                    });
                } else {
                    Report.getStatusCity({ city: Identity.getCurrentUser().tenant.city.name, uf: Identity.getCurrentUser().tenant.city.uf }, function (data) {
                        metrics = data.stats;
                    });
                }
            }

            scope.getMetrics = function () {
                return metrics;
            };

            Platform.whenReady(function () {
                refreshMetrics();
            });

            scope.$watch('objectToInjectInMetrics', function (value) {
                if (value) {
                    scope.Obj = value;
                    scope.Obj.invoke = function (ibgeId) {
                        attrs.ibgeId = ibgeId;
                        refreshMetrics();
                    }
                }
            });

        }

        return {
            link: init,
            scope: {
                ibgeId: '@',
                uf: '@',
                objectToInjectInMetrics: '='
            },
            replace: true,
            templateUrl: '/views/components/metrics_overview.html'
        };
    });

})();