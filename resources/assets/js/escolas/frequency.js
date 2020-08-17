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

            $scope.periodicidades = ['Diaria', 'Semanal', 'Quinzenal', 'Mensal'];

            $scope.query = {
                sort: {},
                max: 5,
                page: 1,
                search: ''
            };

            $scope.classes = {
                school: {
                    periodicidade: null
                },
            };

            $scope.categories = [];

            //Configuracoes iniciais para o Hightchart
            $scope.options_graph = {
                chart: {
                    type: 'line',
                    renderTo: '',
                    width: 1100
                },

                title: { text: 'Frequências das turmas - percentual médio' },

                subtitle: { text: '' },

                xAxis: {
                    //tickInterval: 24 * 3600 * 1000 * 1,

                    gridLineWidth: 1,

                    tickPositions: [],

                    type: "datetime",

                    title: {
                        text: "Períodos"
                    },

                    labels: {
                        rotation: -90,
                        //x: 0,
                        //y: 50,
                        //format: '{value: %d/%m}',
                        formatter: function () {
                            var periodicidade = $scope.getPeriodicidadeFromCategory(this.value);
                            return $scope.getLabelForAxisChart(new Date(this.value), periodicidade);
                        }
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

            $scope.getPeriodicidadeFromCategory = function(value){
                for (var i = 0; i < $scope.categories.length; i++) {
                    if ($scope.categories[i].date === value) {
                        return $scope.categories[i].periodicidade;
                    }
                }
                return null;
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
                $scope.options_graph.series = [];
            };

            $scope.getLabelForAxisChart = function(date, periodicidade){

                if(periodicidade == 'Diaria'){
                    var splitDate = date.toISOString().substr(0, 10).split('-');
                    return splitDate[2]+"/"+splitDate[1];
                }

                if(periodicidade == 'Semanal'){
                    var splitDate1 = $scope.subtractDaysOfDayInstance(date, 4).toISOString().substr(0, 10).split('-');
                    var splitDate2 = date.toISOString().substr(0, 10).split('-');
                    return splitDate1[2]+"/"+splitDate1[1] +" até "+ splitDate2[2]+"/"+splitDate2[1];
                }

                if(periodicidade == 'Quinzenal'){
                    var splitDate1 = $scope.subtractFortnightOfDayInstance(date).toISOString().substr(0, 10).split('-');
                    var splitDate2 = date.toISOString().substr(0, 10).split('-');
                    return splitDate1[2]+"/"+splitDate1[1] +" até "+ splitDate2[2]+"/"+splitDate2[1];
                }

                if(periodicidade == 'Mensal'){
                    var splitDate1 = $scope.subtractMonthOfDayInstance(date).toISOString().substr(0, 10).split('-');
                    var splitDate2 = date.toISOString().substr(0, 10).split('-');
                    return splitDate1[2]+"/"+splitDate1[1] +" até "+ splitDate2[2]+"/"+splitDate2[1];
                }

            };

            $scope.initChart = function(){

                $scope.periodicidades.forEach( function (period) {

                    $scope.clearGraph();
                    $scope.categories = [];

                    $scope.classes.turmas.forEach( function(element) {

                        var data = [];

                        element.frequencies.forEach( function (frequency) {

                            if(frequency.periodicidade == period){

                                $scope.options_graph.chart.renderTo = "graph_"+period;

                                var dataSplit = frequency.created_at.substr(0, 10).split('-');
                                data.push([
                                    Date.UTC(parseInt(dataSplit[0]), parseInt(dataSplit[1])-1, parseInt(dataSplit[2])),
                                    parseInt(frequency.qty_presence),
                                ]);
                                $scope.options_graph.xAxis.tickPositions.push(
                                    Date.UTC(parseInt(dataSplit[0]), parseInt(dataSplit[1])-1, parseInt(dataSplit[2]))
                                );
                                $scope.categories.push({
                                    date: Date.UTC(parseInt(dataSplit[0]), parseInt(dataSplit[1])-1, parseInt(dataSplit[2])),
                                    periodicidade: frequency.periodicidade
                                });

                            }

                        });

                        $scope.options_graph.series.push({
                            name: element.name,
                            data: data,
                        });

                    });

                    var chart = new Highcharts.chart( 'chart_classes_'+period, $scope.options_graph);

                });

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
                    )).then(function () {
                        $scope.refresh();
                    });
            };

            $scope.refresh = function () {

                Classes.frequencies({id: $scope.school_id}).$promise
                    .then(function (res) {
                        $scope.classes = res;
                        $scope.refreshOptionsGraph(); //atualiza as opcoes do grafico
                        $scope.initChart(); //inicia o grafico

                        document.getElementById("aba_"+$scope.classes.school.periodicidade.toLowerCase()).classList.add("active"); //ativa a aba correta dos graficos
                        document.getElementById("aba_"+$scope.classes.school.periodicidade.toLowerCase()).classList.add("in");
                        document.getElementById("li_"+$scope.classes.school.periodicidade.toLowerCase()).classList.add("active");
                        document.getElementById("link_"+$scope.classes.school.periodicidade.toLowerCase()).setAttribute("aria-expanded", "true");

                    });

            };

            $scope.refresh();

            //subtrair um dia considerando finais de semana
            $scope.subtractDaysOfDayInstance = function(date, days) {
                var copy = new Date(Number(date));
                copy.setDate(date.getDate() - days);
                if( copy.getUTCDay() == 0 ) //domingo
                { copy.setDate(copy.getDate() - 2); }
                if( copy.getUTCDay() == 6 ) //sabado
                { copy.setDate(copy.getDate() - 1); }
                return copy;
            };

            //pega a ultima sexta-feira para periodicidade semanal
            $scope.subtractAWeekOfDayInstance = function(date){
                var lastFriday = new Date(Number(date));
                if(date.getDay() == 5){
                    lastFriday = $scope.subtractDaysOfDayInstance(date, 7);
                }
                while (lastFriday.getDay() != 5){
                    lastFriday = $scope.subtractDaysOfDayInstance(lastFriday, 1);
                }
                return lastFriday;
            };

            //pega o ultimo dia 15 ou dia 1o
            $scope.subtractFortnightOfDayInstance = function(date){
                var date2 = new Date(Number(date));
                if(date.getUTCDate() > 15){
                    date2.setUTCDate(15);
                }else{ //se é de 1 a 15 pega ultima data do mes anterior
                    date2 = new Date(date.getFullYear(), date.getMonth(), 0);
                }
                return date2;
            };

            //menos um mês completo- ultimo dia do mês anterior
            $scope.subtractMonthOfDayInstance = function(date) {
                return new Date(date.getFullYear(), date.getMonth(), 0);
            };

        });
})();