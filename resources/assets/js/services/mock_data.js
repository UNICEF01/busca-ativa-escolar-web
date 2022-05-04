(function() {

    angular.module('BuscaAtivaEscolar').factory('MockData', function() {

        var alertReasons = [
            "Adolescente em conflito com a lei",
            "Criança ou adolescente com deficiência(s)",
            "Criança ou adolescente com doença(s) que impeça(m) ou dificulte(m) a frequência à escola",
            "Criança ou adolescente em abrigo",
            "Criança ou adolescente em situação de rua",
            "Criança ou adolescente vítima de abuso / violência sexual",
            "Evasão porque sente a escola desinteressante",
            "Falta de documentação da criança ou adolescente",
            "Falta de infraestrutura escolar",
            "Falta de transporte escolar",
            "Gravidez na adolescência",
            "Preconceito ou discriminação racial",
            "Trabalho infantil",
            "Uso, abuso ou dependência de substâncias psicoativas",
            "Violência familiar",
            "Violência na escola"
        ];
        var alertReasonsPriority = [{
                'name': "Adolescente em conflito com a lei",
                'priority': 1
            },
            {
                'name': "Criança ou adolescente com deficiência(s)",
                'priority': 1
            },
            {
                'name': "Criança ou adolescente com doença(s) que impeça(m) ou dificulte(m) a frequência à escola",
                'priority': 2
            },
            {
                'name': "Criança ou adolescente em abrigo",
                'priority': 1
            },
            {
                'name': "Criança ou adolescente em situação de rua",
                'priority': 1
            },
            {
                'name': "Criança ou adolescente vítima de abuso / violência sexual",
                'priority': 1
            },
            {
                'name': "Evasão porque sente a escola desinteressante",
                'priority': 3
            },
            {
                'name': "Falta de documentação da criança ou adolescente",
                'priority': 3
            },
            {
                'name': "Falta de infraestrutura escolar",
                'priority': 2
            },
            {
                'name': "Falta de transporte escolar",
                'priority': 3
            },
            {
                'name': "Gravidez na adolescência",
                'priority': 2
            },
            {
                'name': "Preconceito ou discriminação racial",
                'priority': 1
            },
            {
                'name': "Uso, abuso ou dependência de substâncias psicoativas",
                'priority': 1
            },
            {
                'name': "Trabalho infantil",
                'priority': 1
            },
            {
                'name': "Violência familiar",
                'priority': 1
            },
            {
                'name': "Violência na escola",
                'priority': 1
            },
        ];

        var searchReasons = [
            "Adolescente em conflito com a lei",
            "Criança ou adolescente com deficiência física",
            "Criança ou adolescente com deficiência intelectual",
            "Criança ou adolescente com deficiência mental",
            "Criança ou adolescente com deficiência sensorial",
            "Criança ou adolescente com doenças (que impedem e/ou dificultem a frequência à escola)",
            "Criança ou adolescente em abrigos",
            "Criança ou adolescente em situação de rua",
            "Criança ou adolescente que sofrem ou sofreram abuso / violência sexual",
            "Evasão porque sente a escola desinteressante",
            "Falta de documentação da criança ou adolescente",
            "Falta de infraestrutura escolar (Escola)",
            "Falta de infraestrutura escolar (Vagas)",
            "Falta de transporte escolar",
            "Gravidez na adolescência",
            "Preconceito ou discriminação racial",
            "Trabalho infantil",
            "Uso, abuso ou dependência de substâncias psicoativas",
            "Violência familiar",
            "Violência na escola (Discriminação de gênero)",
            "Violência na escola (Discriminação racial)",
            "Violência na escola (Discriminação religiosa)"
        ];

        var states = [
            { id: 'SP', name: 'São Paulo' },
            { id: 'MG', name: 'Minas Gerais' },
            { id: 'RJ', name: 'Rio de Janeiro' },
            { id: 'DF', name: 'Distrito Federal' }
        ];

        var cities = [
            { id: 1, state: 'SP', name: 'São Paulo' },
            { id: 2, state: 'SP', name: 'Campinas' },
            { id: 3, state: 'MG', name: 'Belo Horizonte' },
            { id: 4, state: 'RJ', name: 'Rio de Janeiro' },
            { id: 5, state: 'DF', name: 'Brasília' }
        ];

        var groups = [
            { id: 1, name: 'Secretaria de Segurança Pública' },
            { id: 2, name: 'Secretaria da Educação' },
            { id: 3, name: 'Secretaria do Verde e Meio Ambiente' },
            { id: 4, name: 'Secretaria dos Transportes' }
        ];

        var userTypes = [
            { id: 1, name: 'Agente Comunitário' },
            { id: 2, name: 'Técnico(a) Verificador' },
            { id: 3, name: 'Supervisor(a) Institucional' },
            { id: 4, name: 'Coordenador(a) Operacional' }
        ];

        var brazilMapData = [{
                "hc-key": "br-sp",
                "value": 0
            },
            {
                "hc-key": "br-ma",
                "value": 1
            },
            {
                "hc-key": "br-pa",
                "value": 2
            },
            {
                "hc-key": "br-sc",
                "value": 3
            },
            {
                "hc-key": "br-ba",
                "value": 4
            },
            {
                "hc-key": "br-ap",
                "value": 5
            },
            {
                "hc-key": "br-ms",
                "value": 6
            },
            {
                "hc-key": "br-mg",
                "value": 7
            },
            {
                "hc-key": "br-go",
                "value": 8
            },
            {
                "hc-key": "br-rs",
                "value": 9
            },
            {
                "hc-key": "br-to",
                "value": 10
            },
            {
                "hc-key": "br-pi",
                "value": 11
            },
            {
                "hc-key": "br-al",
                "value": 12
            },
            {
                "hc-key": "br-pb",
                "value": 13
            },
            {
                "hc-key": "br-ce",
                "value": 14
            },
            {
                "hc-key": "br-se",
                "value": 15
            },
            {
                "hc-key": "br-rr",
                "value": 16
            },
            {
                "hc-key": "br-pe",
                "value": 17
            },
            {
                "hc-key": "br-pr",
                "value": 18
            },
            {
                "hc-key": "br-es",
                "value": 19
            },
            {
                "hc-key": "br-rj",
                "value": 20
            },
            {
                "hc-key": "br-rn",
                "value": 21
            },
            {
                "hc-key": "br-am",
                "value": 22
            },
            {
                "hc-key": "br-mt",
                "value": 23
            },
            {
                "hc-key": "br-df",
                "value": 24
            },
            {
                "hc-key": "br-ac",
                "value": 25
            },
            {
                "hc-key": "br-ro",
                "value": 26
            }
        ];

        var caseStatuses = [
            'Em andamento',
            'Em atraso',
            'Concluído',
            'Dentro da escola',
            'Fora da escola'
        ];

        return {

            alertReasons: alertReasons,
            searchReasons: searchReasons,
            caseStatuses: caseStatuses,
            alertReasonsPriority: alertReasonsPriority,

            states: states,
            cities: cities,
            groups: groups,
            userTypes: userTypes,


            caseTypesChart: {
                options: {
                    chart: {
                        type: 'bar'
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    }
                },
                xAxis: {
                    categories: alertReasons,
                    title: {
                        text: null
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Quantidade de casos',
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    valueSuffix: ' casos'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: -40,
                    y: 80,
                    floating: true,
                    borderWidth: 1,
                    backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                    shadow: true
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: 'Alertas realizados',
                    data: [105, 95, 42, 74, 38, 10, 12, 50, 70, 60, 40, 122, 78, 47]
                }]
            },

            evolutionChart: {
                type: 'LineChart',
                options: {
                    "colors": ['#0000FF', '#009900', '#CC0000', '#DD9900'],
                    "defaultColors": ['#0000FF', '#009900', '#CC0000', '#DD9900'],
                    "isStacked": "true",
                    "fill": 20,
                    "displayExactValues": true,
                    "vAxis": {
                        "title": "Casos",
                        "gridlines": {
                            "count": 10
                        }
                    },
                    "hAxis": {
                        "title": "Período"
                    }
                },
                data: {
                    "cols": [{
                        id: "period",
                        label: "Período",
                        type: "string"
                    }, {
                        id: "open-cases",
                        label: "Alertas realizados",
                        type: "number"
                    }, {
                        id: "pending-cases",
                        label: "Casos em andamento",
                        type: "number"
                    }, {
                        id: "closed-cases",
                        label: "Crianças (re)matriculadas",
                        type: "number"
                    }],
                    "rows": [{
                        c: [{
                            v: "Primeira semana"
                        }, {
                            v: 100
                        }, {
                            v: 15
                        }, {
                            v: 50
                        }]
                    }, {
                        c: [{
                            v: "Segunda semana"
                        }, {
                            v: 80
                        }, {
                            v: 20
                        }, {
                            v: 60
                        }]

                    }, {
                        c: [{
                            v: "Terceira semana"
                        }, {
                            v: 60
                        }, {
                            v: 30
                        }, {
                            v: 120
                        }]
                    }, {
                        c: [{
                            v: "Quarta semana"
                        }, {
                            v: 75
                        }, {
                            v: 25
                        }, {
                            v: 160
                        }]
                    }]
                }
            },

            generateCasesTimelineChart: function() {

                var settings = {
                    options: {
                        chart: {
                            type: 'line'
                        },

                        xAxis: {
                            currentMin: 1,
                            currentMax: 30,
                            title: { text: 'Últimos 30 dias' },
                            allowDecimals: false
                        },

                        yAxis: {
                            title: { text: 'Quantidade de casos' }
                        }
                    },
                    series: [{
                            name: 'Alertas realizados',
                            data: []
                        },
                        {
                            name: 'Casos em andamento',
                            data: []
                        },
                        {
                            name: 'Crianças (re)matriculadas',
                            data: []
                        }
                    ],
                    title: {
                        text: ''
                    },

                    loading: false
                };

                var numDays = 30;

                for (var i = 0; i < 30; i++) {
                    settings.series[0].data.push(Math.floor(160 + (Math.random() * (numDays / 2))));
                    settings.series[1].data.push(Math.floor(150 + (Math.random() * (numDays / 2))));
                    settings.series[2].data.push(Math.floor(120 + (Math.random() * (numDays / 2))));
                }

                return settings;

            },

            brazilMapData: brazilMapData,

            brazilMapSettings: {

                options: {
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        map: {
                            mapData: Highcharts.maps['countries/br/br-all'],
                            joinBy: ['hc-key']
                        }
                    },

                    mapNavigation: {
                        enabled: true,
                        buttonOptions: {
                            verticalAlign: 'bottom'
                        }
                    },

                    colorAxis: {
                        min: 0
                    }
                },

                chartType: 'map',
                title: {
                    text: ''
                },

                series: [{
                    data: brazilMapData,
                    mapData: Highcharts.maps['countries/br/br-all'],
                    joinBy: 'hc-key',
                    name: 'Quantidade (abs)',
                    states: {
                        hover: {
                            color: '#BADA55'
                        }
                    },
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }]
            }


        }

    });

})();