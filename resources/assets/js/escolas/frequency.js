(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('frequency', {
                url: '/frequencia/{school_id}',
                templateUrl: '/views/escolas/frequencia.html',
                controller: 'FrequencyCtrl',
                unauthenticated: true
            });
        })
        .controller('FrequencyCtrl', function ($scope, $stateParams, ngToast, Classes) {

            $scope.school_id = $stateParams.school_id;

            $scope.options_graph = {
                chart: { type: 'line' },
                title: { text: 'Registros de frequências das turmas' },
                subtitle: {
                    text: 'Fonte: Busca Ativa Escolar'
                },
                xAxis: {
                    title: { text: 'Data do fim do período da configuração' }
                },
                yAxis: {
                    title: {
                        text: 'Frequência'
                    }
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: true
                    }
                },
                series: []
            };

            $scope.classes = {};

            $scope.toBeUpdated = null;

            $scope.onModifyFrequency = function(turma){
                var newValuePresenca = angular.element('#frequency_'+turma.id).val();
                turma.qty_presence = newValuePresenca;
                Classes.updateFrequency(turma).$promise
                    .then(function (res) {
                        $scope.refresh();
                    });
            };

            $scope.clearGraph = function(){
                $scope.options_graph.xAxis.categories = [];
                $scope.options_graph.series = [];
            };

            $scope.initChart = function(){

                $scope.clearGraph();

                $scope.classes.turmas.forEach( function(element) {

                    var data = [];

                    $scope.options_graph.xAxis.categories = [];

                    element.frequencies.forEach( function (frequency) {
                        data.push([
                            frequency.created_at, parseInt(frequency.qty_presence)
                        ]);
                    });

                    $scope.options_graph.series.push({
                        name: element.name,
                        data: data
                    });

                });

                Highcharts.chart( 'chart_classes', $scope.options_graph);
            };

            $scope.refresh = function () {

                Classes.find({id: $scope.school_id}).$promise
                    .then(function (res) {
                        $scope.classes = res;
                        $scope.initChart();
                    });

            };

            $scope.refresh();

        });
})();