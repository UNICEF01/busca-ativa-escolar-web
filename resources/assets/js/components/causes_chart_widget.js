(function () {

    angular.module('BuscaAtivaEscolar').directive('causesChart', function ($timeout, moment, Platform, Reports, Charts) {

        function init(scope, element, attrs) {

            var causesData = {};
            var causesChart = {};
            var causesReady = false;

            var isReady = false;
            var hasEnoughData = false;

            scope.showFilter = false;

            scope.sort = 'maxToMin';

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
                if(value === null || typeof value === 'number'){
                    scope.showFilter = false;
                }
                scope.selectedMenu = value;
                var searchData = {
                    view: 'linear',
                    entity: 'children',
                    dimension: 'case_cause_ids',
                    filters: {
                        case_status: ['in_progress','cancelled', 'completed', 'interrupted', 'transferred'],
                        alert_status: ['accepted']
                    }
                }
                if(typeof value === 'number'){
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

                var sortable = [];
                var objSorted = {};
                var finalLabels = {};

                for (var value in report) {
                    sortable.push([value, report[value]]);
                }

                if(scope.sort == 'minToMax'){
                    sortable.sort(function(a, b) {
                        return a[1] - b[1];
                    });
                }

                if(scope.sort == 'maxToMin'){
                    sortable.sort(function(a, b) {
                        return b[1] - a[1];
                    });
                }

                sortable.forEach(function(item){
                    objSorted["_"+item[0]]=item[1]
                });

                for (var key in labels){
                    finalLabels["_"+key] = labels[key];
                }

                return Charts.generateDimensionChart(objSorted, chartName, finalLabels, 'bar');
            }

            function getCausesConfig() {
                if (!causesReady) return;
                return causesChart;
            }

            Platform.whenReady(function () {
                scope.fetchCausesData(null);
            });
            //Date Picker and Masks


            scope.today = function() {
                scope.dt = new Date();
            };
            scope.today();

            scope.clear = function() {
                scope.dt = null;
            };

            scope.inlineOptions = {
                minDate: new Date(),
                showWeeks: false
            };

            scope.dateOptions1 = {
                formatYear: 'yyyy',
                showWeeks: false

            };

            scope.dateOptions2 = {
                formatYear: 'yyyy',
                maxDate: new Date(),
                showWeeks: false
            };

            scope.open1 = function() {
                scope.popup1.opened = true;
            };

            scope.open2 = function() {
                scope.popup2.opened = true;
            };

            scope.format = 'ddMMyyyy';
            scope.altInputFormats = ['M!/d!/yyyy'];

            scope.popup1 = {
                opened: false
            };

            scope.popup2 = {
                opened: false
            };

            scope.refresByMinToMax = function () {
                scope.sort = 'minToMax';
                scope.fetchCausesData(null);
            };

            scope.refresByMaxToMin = function () {
                scope.sort = 'maxToMin';
                scope.fetchCausesData(null);
            }
        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/components/causes_chart.html'
        };
    });

})();