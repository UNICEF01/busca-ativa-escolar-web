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

            $scope.tickPositions = {
                Diaria: [],
                Semanal: [],
                Quinzenal: [],
                Mensal: [],
            };

            //Configuracoes iniciais para o Hightchart
            $scope.options_graph = {

                legend: {
                    enabled: true
                },

                rangeSelector: {
                    enabled: false
                },

                chart: {
                    type: 'line',
                    renderTo: '',
                    width: 1100,
                    height: 600
                },

                title: { text: '' },

                subtitle: { text: '' },

                xAxis: {

                    tickPositions: [],

                    gridLineWidth: 1,

                    type: "datetime",

                    title: {
                        text: ""
                    },

                    labels: {
                        rotation: -90,
                        //x: 0,
                        y: 50,
                        format: '{value: %d/%m}',
                        // formatter: function () {
                        //     return $scope.getLabelForAxisChart(new Date(this.value), this.chart.title.textStr.substr(25));
                        // }
                    },
                    crosshair: true
                },

                // tooltip: {
                //     formatter: function () {
                //         return this.points.reduce(function (s, point) {
                //             if( point.series.chart.title.textStr.substr(25) != 'Diária'){
                //                 return $scope.getLabelForAxisChart(new Date(parseInt(s.replace('<b>', '').replace('</b>', ''))), point.series.chart.title.textStr.substr(25))
                //                     + '<br/>' + point.series.name + ': ' +
                //                     point.y + 'm';
                //             }else{
                //                 return s + '<br/>' + point.series.name + ': ' + point.y;
                //             }
                //         }, '<b>' + this.x + '</b>');
                //     },
                //     shared: true
                // },

                yAxis: {
                    title: {
                        text: 'Frequência'
                    }
                },

                plotOptions: {
                    series: {
                        allowPointSelect: true,
                        marker: {
                            enabled: true,
                            radius: 3
                        }
                    },
                },

                credits:{
                    enabled:false,
                },

                series: []
            };

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

            $scope.getLabelForAxisChart = function(date, periodicidade){

                if(periodicidade == 'Diária'){
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

                /*
                    No topo da página frequencia.html mudamos a referência para Highcharts para highstock
                    O Highcharts usado aqui é diferente do usado na plataforma como diretiva
                    A diretiva foi completamente personalizada e impede o uso personalizado aqui
                 */

                // Solução para problema de resize
                (function(H) {
                    H.wrap(
                        H.Navigator.prototype,
                        'drawMasks',
                        function(proceed, zoomedMin, zoomedMax) {
                            if (!H.isNumber(zoomedMin) || !H.isNumber(zoomedMax)) {
                                return;
                            }
                            proceed.apply(this, Array.prototype.slice.call(arguments, 1))
                        }
                    );
                })(Highcharts);

                // Configurações de idioma
                Highcharts.setOptions({
                    lang: {
                        months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                        shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                        weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
                        loading: ['Atualizando o gráfico...'],
                        contextButtonTitle: 'Exportar gráfico',
                        decimalPoint: ',',
                        thousandsSep: '.',
                        downloadJPEG: 'Baixar imagem JPEG',
                        downloadPDF: 'Baixar arquivo PDF',
                        downloadPNG: 'Baixar imagem PNG',
                        downloadSVG: 'Baixar vetor SVG',
                        printChart: 'Imprimir gráfico',
                        rangeSelectorFrom: 'De',
                        rangeSelectorTo: 'Para',
                        rangeSelectorZoom: 'Zoom',
                        resetZoom: 'Voltar zoom',
                        resetZoomTitle: 'Voltar zoom para nível 1:1'
                    }
                });

                /*
                    Para cada periodicidade do array de periodicidades
                    percerremos turmas e suas respectivas frequências
                    para setar as configuraçoes do gráfico
                    Cada gráfico recebe um objeto de configuracao
                 */
                $scope.periodicidades.forEach( function (period) {

                    $scope.options_graph.series = [];
                    $scope.options_graph.xAxis.tickPositions = [];
                    $scope.options_graph.chart.renderTo = 'chart_classes_'+period;
                    $scope.options_graph.title.text = 'Frequências das turmas - '+$scope.getNamePeriodicidades(period);

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

                                $scope.tickPositions[period].push(
                                    Date.UTC(parseInt(dataSplit[0]), parseInt(dataSplit[1])-1, parseInt(dataSplit[2]))
                                );
                            }

                        });

                        $scope.options_graph.series.push({
                            name: element.name,
                            data: data,
                        });

                    });

                    var chart = new Highcharts.stockChart( 'chart_classes_'+period, $scope.options_graph);

                });

            };

            $scope.calculatePercentualFrequencies = function(arrayFrequencies, totalStudents){
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

            $scope.getNamePeriodicidades = function(period){
                var periodicidades = {
                    Diaria: 'Diária',
                    Semanal: 'Semanal',
                    Quinzenal: 'Quinzenal',
                    Mensal: 'Mensal'
                };
                return periodicidades[period];
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
                        $scope.initChart();

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