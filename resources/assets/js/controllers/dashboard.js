(function () {

    angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($scope, $http, moment, Platform, Identity, StaticData, Tenants, Reports, Graph, Config) {

        $scope.identity = Identity;
        $scope.static = StaticData;
        $scope.tenantInfo = Tenants.getSettings();
        $scope.tenants = [];

        $scope.query = angular.merge({}, $scope.defaultQuery);
        $scope.search = {};

        $scope.options_selo =['TODOS', 'SOMENTE SELO', 'SEM O SELO'];

        $scope.query_evolution_graph = {
            uf: '',
            tenant_id: '',
            selo: 'TODOS'
        };

        $scope.schema = [
            {
                "name": "Date",
                "type": "date",
                "format": "%Y-%m-%d"
            },
            {
                "name": "Rematricula",
                "type": "string"
            },
            {
                "name": "Unemployment",
                "type": "number"
            }
        ];

        $scope.dataSource = {
            caption: {
                text: "Evolução (Re)Matrículas"
            },
            subcaption: {
                text: "Período de "+moment().subtract(100, "days").format('DD/MM/YYYY')+" até "+moment().format('DD/MM/YYYY')
            },
            series: "Rematricula",
            yaxis: [
                {
                    format: {
                        formatter: function(obj){
                            var val=null;
                            if( obj.type === "axis")
                            {
                                val= obj.value
                            }
                            else
                            {
                                val= obj.value.toString().replace(".",",");
                            }
                            return val;
                        }

                    },
                    plot: [
                        {
                            value: "Unemployment",
                            type: "column"
                        }
                    ],
                    title: "(Re)Matrículas",
                    referenceline: [
                        {
                            label: "Meta Selo UNICEF"
                        }
                    ],
                    defaultFormat: false
                }
            ],
            xAxis: {
                initialInterval: {
                    from: moment().subtract(100, "days").format('YYYY-MM-DD'),
                    to: moment().format('YYYY-MM-DD')
                },
                outputTimeFormat: {
                    year: "%Y",
                    month: "%m/%Y",
                    day: "%d/%m/%Y"
                },
                timemarker: [{
                    timeFormat: '%m/%Y'
                }]
            },
            tooltip: {
                enabled: "false", // Disables the Tooltip
                outputTimeFormat: {
                    day: "%d/%m/%Y"
                },
                style: {
                    container: {
                        "border-color": "#000000",
                        "background-color": "#75748D"
                    },
                    text: {
                        "color": "#FFFFFF"
                    }
                }
            }
        };

        $scope.getUFs = function () {
            return StaticData.getUFs();
        };

        $scope.getData = function () {

            Identity.provideToken().then(function (token) {

                var jsonify = function (res) { return res.json(); }

                var dataDaily = fetch(Config.getAPIEndpoint() + 'reports/data_rematricula_daily?uf='+$scope.query_evolution_graph.uf+'&tenant_id='+$scope.query_evolution_graph.tenant_id+'&selo='+$scope.query_evolution_graph.selo+'&token=' + token).then(jsonify);

                Promise.all([dataDaily]).then( function( res) {
                    const data = res[0];

                    var data_final = [
                        {date: moment().format('YYYY-MM-DD'), value: "0", tipo: "(Re)matrícula"},
                        {date: moment().format('YYYY-MM-DD'), value: "0", tipo: "Cancelamento"}
                    ];

                    if( parseInt(data.data.length) > 0 ) { data_final = data.data; }

                    const fusionTable = new FusionCharts.DataStore().createDataTable(

                        data_final.map(function(x) {
                            return [
                                x.date,
                                x.tipo,
                                parseFloat(x.value)
                            ]
                        }),

                        $scope.schema
                    );
                    $scope.$apply(function () {

                        if( data.selo == "SOMENTE SELO" && data.goal > 0) {
                            $scope.dataSource.yaxis[0].Max = data.goal;
                            $scope.dataSource.yaxis[0].referenceline[0].label = "Meta Selo UNICEF";
                            $scope.dataSource.yaxis[0].referenceline[0].value = data.goal;
                        }

                        if( data.selo == "SEM O SELO" || data.selo == "TODOS") {
                            $scope.dataSource.yaxis[0].referenceline[0] = {};
                        }

                        $scope.dataSource.data = fusionTable;
                    });

                    $scope.initTenants();
                });

            });
        }

        $scope.initTenants = function(){
            if (Identity.getType() === 'coordenador_estadual') {
                $scope.tenants = Tenants.findByUfPublic({'uf': $scope.identity.getCurrentUser().uf});
            }
        };

        $scope.atualizaDash = function () {
            $scope.tenants = Tenants.findByUfPublic({'uf': $scope.query_evolution_graph.uf});
            $scope.getData();
        };

        $scope.onSelectCity = function () {
            $scope.getData();
        };

        $scope.refresh = function () {
            if (($scope.query.uf !== undefined) && ($scope.query.tenant_id !== undefined)) {
                $scope.tenants = Graph.getReinsertEvolution({'uf': $scope.query.uf});
            }
        };

        $scope.getTenants = function () {
            if (!$scope.tenants || !$scope.tenants.data) return [];
            return $scope.tenants.data;
        };

        $scope.ready = false;

        $scope.showInfo = '';

        $scope.steps = [
            {name: 'Adesão', info: ''},
            {name: 'Configuração', info: ''},
            {name: '1º Alerta', info: ''},
            {name: '1º Caso', info: ''},
            {name: '1ª (Re)matrícula', info: ''}
        ]

        $scope.chartWithContentDownload = function () {
            window.scrollTo(0, 100);

            var cloneDom = $("#regua").clone(true);

            if (typeof html2canvas !== 'undefined') {
                // The following is the processing of SVG
                var nodesToRecover = [];
                var nodesToRemove = [];
                var svgElem = cloneDom.find('svg'); //divReport is the ID of the DOM that needs to be intercepted into pictures
                svgElem.each(function (index, node) {
                    var parentNode = node.parentNode;
                    var svg = node.outerHTML.trim();

                    var canvas = document.createElement('canvas');

                    canvg(canvas, svg);

                    nodesToRecover.push({
                        parent: parentNode,
                        child: node
                    });
                    parentNode.removeChild(node);

                    nodesToRemove.push({
                        parent: parentNode,
                        child: canvas
                    });

                    parentNode.appendChild(canvas);
                });

                // The clone node is dynamically appended to the body.
                $("#regua_print").append(cloneDom);

                html2canvas(cloneDom, {
                    onrendered: function (canvas) {
                        var data = canvas.toDataURL("image/png");
                        var docDefinition = {
                            content: [{
                                image: data,
                                width: 500,
                                logging: true,
                                profile: true,
                                useCORS: true,
                                allowTaint: true
                            }]
                        };
                        pdfMake.createPdf(docDefinition).download("painel_de_metas.pdf");
                        $("#regua_print").empty();
                    }
                });

            }
        }

        if (identify.type !== 'gestor_nacional') {
            Reports.getStatusBar(function (data) {

                var meta = data.goal_box && data.goal_box.goal || 0;
                var atingido = data.goal_box && data.goal_box.reinsertions_classes || 0;
                $scope.percentualAtingido = Math.floor((atingido * 100) / meta);
                // $scope.percentualAtingido = 100;

                if (data.status !== 'ok') {
                    $scope.steps[0].info = data.bar && data.bar.registered_at || 0;
                    $scope.steps[1].info = data.bar && data.bar.config.updated_at || 0;
                    $scope.steps[2].info = data.bar && data.bar.first_alert || 0;
                    $scope.steps[3].info = data.bar && data.bar.first_case || (data.bar.first_alert || 0);
                    $scope.steps[4].info = data.bar && data.bar.first_reinsertion_class || 0;
                    $scope.otherData = data;

                    for (var i = 0; $scope.steps.length >= i; i++) {
                        if ($scope.steps[i]) {
                            var actualDate = moment($scope.steps[i].info || 0);
                            if (actualDate._i !== 0) {
                                $scope.showInfo = i;
                            }
                        }
                    }
                }
            });
        }

        function init() {
            $scope.states.length = 0;
            for (var i = 0; i < $scope.stateCount; i++) {
                $scope.states.push({
                    name: 'Step ' + (i + 1).toString(),
                    heading: 'Step ' + (i + 1).toString(),
                    isVisible: true
                });
            }
            $scope.getData();
        };

        $scope.stateCountChange = function () {
            $scope.stateCount = isNaN($scope.stateCount) ? 2 : $scope.stateCount;
            init();
        };

        $scope.setCurrent = function (state) {
            for (var i = 0; i < $scope.states.length; i++) {
                $scope.states[i].isCurrent = false;
            }
            state.isCurrent = true;
        };

        $scope.states = [];
        $scope.stateCount = 2;
        init();

        Platform.whenReady(function () {
            $scope.ready = true;
        });
    });

})();