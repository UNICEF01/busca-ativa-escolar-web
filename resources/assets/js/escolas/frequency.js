(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('frequency', {
                url: '/frequencia',
                templateUrl: '/views/escolas/frequencia.html',
                controller: 'FrequencyCtrl',
                unauthenticated: true
            });
        })
        .controller('FrequencyCtrl', function ($scope, ngToast, Classes) {

            $scope.classes = [];

            $scope.options_graph = {
                title: {
                    text: 'Frequências'
                },
                xAxis: {
                    categories: ['Registro 1', 'Registro 2', 'Registro 3', 'Registro 4', 'Registro 5']
                },
                series: [{
                    data: [29.9, 71.5, 106.4, 129.2, 144.0]
                }]
            };

            $scope.refresh = function () {
                Highcharts.chart( 'chart_classes', $scope.options_graph);
            };

            $scope.refresh();

        });
})();