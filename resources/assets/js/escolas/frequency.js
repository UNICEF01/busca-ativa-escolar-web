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
                chart: {
                    type: 'line'
                },
                title: { text: 'Registros de frequências das turmas' },
                subtitle: {
                    text: 'Fonte: Busca Ativa Escolar'
                },
                xAxis:
                    {
                        tickInterval: 1000 * 60 * 60 * 24,
                        gridLineWidth: 1,
                        type: "date",
                        title: {
                            text: null
                        },
                        labels: {
                            format: '{value: %d-%m-%Y}'
                        }
                    },

                yAxis: {
                    title: {
                        text: 'Frequência'
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x:%e. %b}: {point.y} presentes'
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
                        var dataSplit = frequency.created_at.substr(0, 10).split('-');
                        data.push([
                            Date.UTC(parseInt(dataSplit[0]), parseInt(dataSplit[1])-1, parseInt(dataSplit[2])), parseInt(frequency.qty_presence)
                        ]);
                    });

                    $scope.options_graph.series.push({
                        name: element.name,
                        data: data
                    });

                });

                var chart = new Highcharts.chart( 'chart_classes', $scope.options_graph);
            };

            $scope.refresh = function () {

                Classes.find({id: $scope.school_id}).$promise
                    .then(function (res) {
                        $scope.classes = res;
                        $scope.initChart();
                    });

            };

            $scope.calculatePercentualFrequencies = function(arrayFrequencies, totalStudents){
                var totalFrequencies = arrayFrequencies.length;
                var averageFrequencies = 0;
                arrayFrequencies.forEach( function(element) {
                    averageFrequencies += parseInt(element.qty_presence);
                });
                return ( ( 100* (averageFrequencies/totalFrequencies) ) / totalStudents ).toFixed(2);
            };

            $scope.refresh();

        });
})();