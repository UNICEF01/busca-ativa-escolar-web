(function () {

    angular.module('BuscaAtivaEscolar').directive('causesChart', function ($timeout, moment, Platform, Reports, Charts) {

        function init(scope, element, attrs) {

            var causesData = {};
            var causesChart = {};
            var causesReady = false;

            var isReady = false;
            var hasEnoughData = false;

            scope.showFilter = false;

            scope.getCausesConfig = getCausesConfig;

            scope.isReady = function () {
                return isReady;
            };

            scope.hasEnoughData = function () {
                return hasEnoughData;
            };

            scope.filterShow = function () {
                scope.showFilter = !scope.showFilter;
            }
  
          scope.menuFilter = [
            {name: 'Tudo', title: 'Todos os registros', qtd_days: null},
            {name: 'Semanal', title: 'Ũltimos 7 dias', qtd_days: 7},
            {name: 'Mensal', title: 'Últimos 30 dias', qtd_days: 30},
            {name: 'Trimestral', title: 'Últimos 90 dias', qtd_days: 90},
            {name: 'Semestral', title: 'Últimos 180 dias', qtd_days: 180}
          ]

            scope.fetchCausesData = function (value) {
                scope.selectedMenu = value;
                var searchData = {
                    view: 'linear',
                    entity: 'children',
                    dimension: 'alert_cause_id',
                    filters: {
                        case_status: ['in_progress', 'completed', 'interrupted'],
                        alert_status: ['accepted']
                    }
                }
                if(typeof value === 'number'){
                    scope.showFilter = false;
                    searchData.filters.created_at = {
                        gte: moment().subtract(value, 'days').format('YYYY-MM-DD'),
                        lte: moment().format('YYYY-MM-DD'),
                        format: "YYYY-MM-dd"
                    }
                }
                if (value == 'filter') {
                    if(scope.dt_inicial && scope.dt_final) {
                        searchData.filters.created_at = {
                            gte: moment(scope.dt_inicial).format('YYYY-MM-DD'),
                            lte: moment(scope.dt_final).format('YYYY-MM-DD'),
                            format: "YYYY-MM-dd"
                        }
                    }
                }

                return Reports.query(searchData, function (data) {
                    causesData = data;
                    causesChart = getCausesChart();
                    causesReady = true;

                    isReady = true;
                    hasEnoughData = (
                        causesData &&
                        causesData.response &&
                        !angular.equals({}, causesData.response.report) &&
                        !angular.equals([], causesData.response.report)
                    );

                    $timeout(function () {
                        scope.$broadcast('highchartsng.reflow');
                    }, 500);
                });
            }

            function getCausesChart() {
                var report = causesData.response.report;
                var chartName = 'Divisão dos casos por motivo de evasão escolar';
                var labels = causesData.labels ? causesData.labels : {};

                return Charts.generateDimensionChart(report, chartName, labels, 'pie');
            }

            function getCausesConfig() {
                if (!causesReady) return;
                return causesChart;
            }

            Platform.whenReady(function () {
                scope.fetchCausesData(null);
            });
        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/components/causes_chart.html'
        };
    });

})();