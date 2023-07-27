(function() {

    angular.module('BuscaAtivaEscolar').directive('metricsPlatform', function(Platform, SystemHealth) {

        function init(scope) {

            scope.search = {};

            function refreshMetrics() {
                SystemHealth.getStats({}, function(stats) {
                    scope.search = stats.search;
                })
            }

            scope.renderPctPanelClass = function(value, warn_mark, danger_mark) {
                if (value === null || value === undefined) return 'panel-danger';
                var val = parseFloat(value);
                if (val >= danger_mark) return 'panel-danger';
                if (val >= warn_mark) return 'panel-warning';
                return 'panel-success';
            };

            scope.renderSearchPanelClass = function(status) {
                if (status === 'green') return 'panel-success';
                if (status === 'yellow') return 'panel-warning';
                return 'panel-danger';
            };

            scope.getMetrics = function() {
                return metrics;
            };

            Platform.whenReady(function() {
                refreshMetrics();
            });

        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/components/metrics_platform.html'
        };
    });

})();