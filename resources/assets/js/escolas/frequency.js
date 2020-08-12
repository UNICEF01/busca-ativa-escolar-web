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
        .controller('FrequencyCtrl', function ($scope, $stateParams, ngToast, Classes, Modals) {

            $scope.school_id = $stateParams.school_id;

            $scope.classes = {
                school: {
                    periodicidade: null
                },
            };

            //Configuracoes iniciais para o Hightchart
            $scope.options_graph = {
                chart: {
                    type: 'line'
                },

                title: { text: 'Registros de frequências das turmas' },

                subtitle: {
                    text: '' //sem sutítulo no gráfico
                },

                xAxis: {

                    //tickInterval: 24 * 3600 * 1000 * 1,

                    gridLineWidth: 1,

                    tickPositions: [],

                    type: "datetime",

                    title: {
                        text: "Períodos"
                    },

                    labels: {
                        x: 0,
                        y: 25,
                        format: '{value: %d/%m}',
                        // formatter: function () {
                        //     return new Date(this.value);
                        // }
                    },

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

                credits:{
                    enabled:false,
                },

                series: []
            };

            //Chamado sempre após o refresh da API para atualizar as pré-definicoes do options_graph
            $scope.refreshOptionsGraph = function(){};

            $scope.onModifyFrequency = function(frequency, turma){
                var newValuePresenca = angular.element('#frequency_'+frequency.id).val();
                if( parseInt(turma.qty_enrollment) < parseInt(newValuePresenca) ){
                    Modals.show(Modals.Alert("A frequência não pode ser maior que a quantidade de alunos presentes"));
                    $scope.refresh();
                }else{
                    frequency.qty_presence = parseInt(newValuePresenca);
                    Classes.updateFrequency(frequency).$promise
                        .then(function (res) {
                            $scope.refresh();
                        });
                }
            };

            //Limpa  o grafico - Chamado sempre antes de sua reinicializacao
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
                        $scope.options_graph.xAxis.tickPositions.push(
                            Date.UTC(parseInt(dataSplit[0]), parseInt(dataSplit[1])-1, parseInt(dataSplit[2]))
                        );
                    });

                    $scope.options_graph.series.push({
                        name: element.name,
                        data: data
                    });

                });

                var chart = new Highcharts.chart( 'chart_classes', $scope.options_graph);
            };

            $scope.calculatePercentualFrequencies = function(arrayFrequencies, totalStudents){

                //  1- SOMA TODAS AS FREQUENCIAS. CALCULA A MEDIA. PERCENTUAL RELACIONADO A QUANTIDADE DE ALUNOS DA TURMA
                // var totalFrequencies = arrayFrequencies.length;
                // var averageFrequencies = 0;
                // arrayFrequencies.forEach( function(element) {
                //     averageFrequencies += parseInt(element.qty_presence);
                // });
                // return ( ( 100* (averageFrequencies/totalFrequencies) ) / totalStudents ).toFixed(2);

                // 2- MEDIA BASEADA NA ÚLTIMA FREQUENCIA REGISTRADA
                return ( ( 100* ( arrayFrequencies[(arrayFrequencies.length)-1].qty_presence ) ) / totalStudents ).toFixed(2);
            };

            $scope.finish = function(){
                Modals.show(Modals.Confirm("Lorem ipsum dolor sit amet, consectetur adipiscing elit"))
                    .then(function () {
                        alert('Caminho a seguir ...');
                    });
            };

            $scope.getNamePeriodicidade = function(){
              var periodicidades = {
                  Diaria: 'Diária',
                  Semanal: 'Semanal',
                  Quinzenal: 'Quinzenal',
                  Mensal: 'Mensal'
              };
              return periodicidades[$scope.classes.school.periodicidade];
            };

            $scope.addPeriodFrequency = function(turma){
                Modals.show(
                    Modals.AddPeriodFrequency(
                        turma.name,
                        'Atualização de períodos anteriores | Frequência ' + $scope.getNamePeriodicidade().toLowerCase(),
                        turma,
                        $scope.classes.school.periodicidade
                    ));
            };

            $scope.refresh = function () {

                Classes.find({id: $scope.school_id}).$promise
                    .then(function (res) {
                        $scope.classes = res;
                        $scope.refreshOptionsGraph(); //atualiza as opcoes do grafico
                        $scope.initChart(); //inicia o grafico
                    });

            };

            $scope.refresh();

        });
})();