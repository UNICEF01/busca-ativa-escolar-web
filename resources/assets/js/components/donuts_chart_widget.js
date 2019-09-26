(function () {

    angular.module('BuscaAtivaEscolar').directive('donutsChart', function ($timeout, moment, Platform, Reports, Charts) {

        function getDadosRematricula(scope, element, attrs) {
            Reports.getStatusBar(function (data) {
                if (data.status !== 'ok') {
                    init(scope, element, attrs, data);
                }
            });
        }

        function init(scope, element, attrs, data) {

            var meta = data.goal_box.goal;
            var atingido = data.goal_box.reinsertions_classes;
            scope.showDonuts = 0;

            if (atingido !== 0) {
                scope.showDonuts = 1;
            }

            var percentualAtingido = Math.floor((atingido * 100) / meta);

            var colors = Highcharts.getOptions().colors,
                categories = [
                    'alcancado',
                    'meta'
                ],
                data = [
                    {
                        color: '#19AFA1',
                        drilldown: {
                            name: 'estou',
                            categories: [
                                'Onde estou'
                            ],
                            data: [
                                percentualAtingido
                            ]
                        }
                    },
                    {
                        color: '#9d9d9d',
                        drilldown: {
                            name: 'falta',
                            categories: [
                                'Ainda falta'
                            ],
                            data: [
                                100 - percentualAtingido
                            ]
                        }
                    }
                ],
                browserData = [],
                versionsData = [],
                i,
                j,
                dataLen = data.length,
                drillDataLen,
                brightness;


// Build the data arrays
            for (i = 0; i < dataLen; i += 1) {

                // add browser data
                browserData.push({
                    name: categories[i],
                    y: data[i].y,
                    color: data[i].color
                });

                // add version data
                drillDataLen = data[i].drilldown.data.length;
                for (j = 0; j < drillDataLen; j += 1) {
                    brightness = 0.2 - (j / drillDataLen) / 5;
                    versionsData.push({
                        name: data[i].drilldown.categories[j],
                        y: data[i].drilldown.data[j],
                        color: Highcharts.Color(data[i].color).brighten(brightness).get()
                    });
                }
            }

            console.log(colors)

// Create the chart
            Highcharts.chart('donuts-chart', {
                chart: {
                    type: 'pie'
                },
                title: {
                    text: ''
                },
                plotOptions: {
                    pie: {
                        shadow: false,
                        center: ['50%', '50%']
                    }
                },
                tooltip: {
                    valueSuffix: '%'
                },
                series: [{
                    name: 'Browsers',
                    data: browserData,
                    size: '60%',
                    dataLabels: {
                        formatter: function () {
                            return this.y > 5 ? this.point.name : null;
                        },
                        color: '#ffffff',
                        distance: -30
                    }
                }, {
                    name: 'Porcentagem',
                    data: versionsData,
                    size: '80%',
                    innerSize: '60%',
                    id: 'versions'
                }],
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 400
                        },
                        chartOptions: {
                            series: [{}, {
                                id: 'versions',
                                dataLabels: {
                                    enabled: false
                                }
                            }]
                        }
                    }]
                },
                credits: {
                    enabled: false
                },
                exporting: {enabled: false}
            });
        }

        return {
            link: getDadosRematricula,
            replace: true,
            templateUrl: '/views/components/donuts_chart.html'
        };
    });

})();