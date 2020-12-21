(function () {

    angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($rootScope, $scope, $http, $localStorage, moment, Platform, Identity, StaticData, Tenants, Reports, Graph, Config) {

        $scope.identity = Identity;
        $scope.static = StaticData;
        $scope.tenantInfo = Tenants.getSettings();
        $scope.tenants = [];
        $scope.showDetailsMap = false;
        $scope.showMessageMap = 'Ver detalhes';

        $scope.listeners = {
            click: function () {
            },
            mousemove: function () {
            },
            mouseleave: function () {
            },
            mouseenter: function () {
            },
            drag: function () {
            },
            dragstart: function () {
            },
            dragend: function () {
            },
            mapviewchange: function () {
            },
            mapviewchangestart: function () {
            },
            mapviewchangeend: function () {
            }
        };

        $scope.ufs_selo = {data: []};
        $scope.tenants_selo = {data: []};

        $scope.query = angular.merge({}, $scope.defaultQuery);
        $scope.search = {};

        //--
        $scope.selo_unicef_todos = "TODOS";
        $scope.selo_unicef_participa = "PARTICIPA DO SELO UNICEF";
        $scope.selo_unicef_nao_participa = "NÃO PARTICIPA DO SELO UNICEF";
        //--

        //-- to use with fusionmap
        $scope.childrenMap = null;
        $scope.fusionmap_scope_table = "maps/brazil";
        $scope.fusionmap_scope_uf = null;
        $scope.fusionmap_scope_city = {id: null};
        $scope.fusion_map_config = {
            type: $scope.fusionmap_scope_table,
            renderAt: 'chart-container',
            width: '700',
            height: '730',
            dataFormat: 'json',
            dataSource: {

                "chart": {
                    "caption": "",
                    "subcaption": "",
                    "entityFillHoverColor": "#cccccc",
                    "numberScaleValue": "1.1000.1000",
                    "numberPrefix": "",
                    "showLabels": "0",
                    "theme": "fusion"
                },

                "colorrange": {
                    "minvalue": "0",
                    "startlabel": "",
                    "endlabel": "",
                    "code": "#6baa01",
                    "gradient": "1",
                    "color": []
                },

                "data": []

            },
            "events": {

                "entityClick": function (e) {
                    if ($scope.fusionmap_scope_table == "maps/brazil") {
                        if (e.data.value > 0) {
                            $scope.fusionmap_scope_table = "maps/" + e.data.label.split(" ").join("").toLowerCase();
                            $scope.initFusionChartMapState(e.data.shortLabel, $scope.fusionmap_scope_table);
                        }
                    } else {
                        if (e.data.value > 0) {
                            $scope.fusionmap_scope_city.id = e.data.id;
                            $scope.$apply();
                        }
                    }
                },
                "entityRollover": function (evt, data) {
                    if ($scope.fusionmap_scope_table == "maps/brazil") {
                        document.getElementById('state_' + evt.data.id).style.backgroundColor = "#ddd";
                    }
                },
                "entityRollout": function (evt, data) {
                    if ($scope.fusionmap_scope_table == "maps/brazil") {
                        document.getElementById('state_' + evt.data.id).style.backgroundColor = "#ffffff";
                    }
                }
            }
        };
        $scope.injectedObjectDirectiveCaseMaps = {};
        $scope.objectToInjectInMetrics = {};
        //--

        $scope.options_selo = [
            $scope.selo_unicef_todos,
            $scope.selo_unicef_participa,
            $scope.selo_unicef_nao_participa
        ];

        $scope.query_evolution_graph = {
            uf: '',
            tenant_id: '',
            selo: $scope.selo_unicef_todos
        };

        $scope.show_option_selo = false;
        $scope.show_option_uf = false;
        $scope.show_option_municipio = false;

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
                text: "Período de " + moment().subtract(100, "days").format('DD/MM/YYYY') + " até " + moment().format('DD/MM/YYYY')
            },
            series: "Rematricula",
            yaxis: [
                {
                    format: {
                        formatter: function (obj) {
                            var val = null;
                            if (obj.type === "axis") {
                                val = obj.value
                            } else {
                                val = obj.value.toString().replace(".", ",");
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
                            label: "Meta Selo UNICEF",
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

        $scope.getTablevaluesFormFusionMap = function () {
            return $scope.fusion_map_config.dataSource.data;
        };

        $scope.initFusionChartMap = function () {
            FusionCharts.ready(function () {
                Reports.getDataMapFusionChart(function (data) {

                    $scope.fusionmap_scope_city.id = null;
                    $scope.fusionmap_scope_table = "maps/brazil";
                    $scope.fusion_map_config.type = "maps/brazil";
                    $scope.fusion_map_config.width = "700";
                    $scope.fusionmap_scope_uf = null;
                    $scope.fusion_map_config.dataSource.data = data.data;
                    $scope.fusion_map_config.dataSource.colorrange.color = data.colors;

                    //remove o antigo
                    document.getElementById("chart-container").innerHTML = '';

                    //instancia
                    $scope.childrenMap = new FusionCharts(
                        $scope.fusion_map_config
                    );

                    //renderiza
                    $scope.childrenMap.render();
                });
            });
        };

        $scope.initFusionChartMapState = function (uf, scope_table) {
            Reports.getDataMapFusionChart({uf: uf}, function (data) {

                $scope.fusionmap_scope_city.id = null;
                $scope.fusion_map_config.type = scope_table;
                $scope.fusionmap_scope_uf = uf;
                $scope.fusionmap_scope_table = scope_table;
                $scope.fusion_map_config.width = "1000";

                $scope.fusion_map_config.dataSource.data = data.data;
                $scope.fusion_map_config.dataSource.colorrange.color = data.colors;

                //remove o antigo
                document.getElementById("chart-container").innerHTML = '';

                //instancia
                $scope.childrenMap = new FusionCharts(
                    $scope.fusion_map_config
                );
                //renderiza
                $scope.childrenMap.render();

            });
        };

        $scope.initFusionChartMapCity = function () {
            $scope.injectedObjectDirectiveCaseMaps.invoke($scope.fusionmap_scope_city.id);
            $scope.objectToInjectInMetrics.invoke($scope.fusionmap_scope_city.id, $scope.fusionmap_scope_uf);
        };

        $scope.initFusionChart = function () {

            Identity.provideToken().then(function (token) {

                var jsonify = function (res) {
                    return res.json();
                };

                var dataDaily = fetch(Config.getAPIEndpoint() + 'reports/data_rematricula_daily?uf=' + $scope.query_evolution_graph.uf + '&tenant_id=' + $scope.query_evolution_graph.tenant_id + '&selo=' + $scope.query_evolution_graph.selo + '&token=' + token).then(jsonify);

                Promise.all([dataDaily]).then(function (res) {

                    const data = res[0];

                    var data_final = [
                        {date: moment().format('YYYY-MM-DD'), value: "0", tipo: "(Re)matrícula"},
                        {date: moment().format('YYYY-MM-DD'), value: "0", tipo: "Cancelamento após (re)matrícula"}
                    ];

                    if (parseInt(data.data.length) > 0) {
                        data_final = data.data;
                    }

                    const fusionTable = new FusionCharts.DataStore().createDataTable(
                        data_final.map(function (x) {
                            return [
                                x.date,
                                x.tipo,
                                parseFloat(x.value)
                            ]
                        }),

                        $scope.schema
                    );
                    $scope.$apply(function () {

                        if (data.selo == $scope.selo_unicef_participa && data.goal > 0) {
                            $scope.dataSource.yaxis[0].Max = data.goal;
                            $scope.dataSource.yaxis[0].referenceline[0].label = "Meta Selo UNICEF";
                            $scope.dataSource.yaxis[0].referenceline[0].value = data.goal;
                            $scope.dataSource.yaxis[0].referenceline[0].style = {
                                marker: {
                                    fill: '#CF1717', //cor do circulo e do backgroud do numero da meta
                                    stroke: '#CF1717', //borda do circulo e da linha
                                    'stroke-opacity': 1.0, //opacidade da linha
                                    'stroke-width': 5.0
                                },
                                text: {
                                    fill: '#FFD023',
                                    "font-size": 15
                                }
                            }
                        }

                        if (data.selo == $scope.selo_unicef_nao_participa || data.selo == $scope.selo_unicef_todos) {
                            $scope.dataSource.yaxis[0].Max = 0;
                            $scope.dataSource.yaxis[0].referenceline[0] = {};
                        }

                        $scope.dataSource.data = fusionTable;
                    });

                    $scope.initSelectsOfFusionChart();

                    if ($scope.show_option_uf) {
                        $scope.initUfs();
                    }
                    ;

                });

            });
        };

        $scope.initSelectsOfFusionChart = function () {
            if (Identity.isUserType("coordenador_operacional")
                || Identity.isUserType("supervisor_institucional")
                || Identity.isUserType("gestor_politico")) {

                $scope.show_option_selo = false;
                $scope.show_option_municipio = false;
                $scope.show_option_uf = false;
            }

            if (Identity.isUserType("coordenador_estadual") || Identity.isUserType("gestor_estadual")) {
                $scope.show_option_uf = false;
                $scope.initTenantsSelo();
                $scope.show_option_selo = true;
                $scope.show_option_municipio = true;
                $scope.show_option_uf = false;
            }

            if (Identity.isUserType("gestor_nacional")) {

                $scope.show_option_selo = true;
                $scope.show_option_municipio = true;
                $scope.show_option_uf = true;
            }
        };

        $scope.initTenants = function () {
            if ($scope.uf_profiles_type.includes($scope.identity.getType())) {
                $scope.tenants = Tenants.findByUfPublic({'uf': $scope.identity.getCurrentUser().uf});
            }
        };

        $scope.initUfs = function () {
            $scope.ufs_selo = Reports.getUfsBySelo({selo: $scope.query_evolution_graph.selo});
        };

        $scope.getUfsSelo = function () {
            return $scope.ufs_selo.data;
        };

        $scope.getTenantsSelo = function () {
            return $scope.tenants_selo.data;
        };

        $scope.onSelectSelo = function () {
            $scope.query_evolution_graph.tenant_id = '';
            if (!Identity.isUserType("coordenador_estadual") && !Identity.isUserType("gestor_estadual")) {
                $scope.query_evolution_graph.uf = '';
                $scope.tenants_selo = {data: []};
            }
            if (Identity.isUserType("coordenador_estadual") && Identity.isUserType("gestor_estadual")) {
                $scope.initTenantsSelo();
            }
            $scope.initFusionChart();
        };

        $scope.onSelectUf = function () {
            $scope.query_evolution_graph.tenant_id = '';
            $scope.tenants_selo = Reports.getTenantsBySelo({
                selo: $scope.query_evolution_graph.selo,
                uf: $scope.query_evolution_graph.uf
            });
            $scope.initFusionChart();
        };

        $scope.onSelectCity = function () {
            $scope.initFusionChart();
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
        ];

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
        };

        $scope.initStatusBar = function () {

            Reports.getStatusBar(function (data) {

                var meta = data.goal_box && data.goal_box.goal || 0;

                if (meta == 0) {
                    $scope.query_evolution_graph.selo = $scope.selo_unicef_todos;
                }

                if (meta > 0) {
                    $scope.query_evolution_graph.selo = $scope.selo_unicef_participa;
                }

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

                $scope.initFusionChart();

            });

            $scope.initFusionChart();

        };

        $scope.initTenantsSelo = function () {
            $scope.tenants_selo = Reports.getTenantsBySelo({
                selo: $scope.query_evolution_graph.selo,
                uf: $scope.identity.getCurrentUser().uf
            });
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

        function returnStateByIDFusionMap(sigla) {
            var states =
                [
                    {sigla: 'AC', id: '001', state: 'Acre'},
                    {sigla: 'AL', id: '002', state: 'Alagoas'},
                    {sigla: 'AP', id: '003', state: 'Amapa'},
                    {sigla: 'AM', id: '004', state: 'Amazonas'},
                    {sigla: 'BA', id: '005', state: 'Bahia'},
                    {sigla: 'CE', id: '006', state: 'Ceara'},
                    {sigla: 'DF', id: '007', state: 'Distrito Federal'},
                    {sigla: 'ES', id: '008', state: 'Espirito Santo'},
                    {sigla: 'GO', id: '009', state: 'Goias'},
                    {sigla: 'MA', id: '010', state: 'Maranhao'},
                    {sigla: 'MG', id: '011', state: 'Mato Grosso'},
                    {sigla: 'MS', id: '012', state: 'Mato Grosso do Sul'},
                    {sigla: 'MG', id: '013', state: 'Minas Gerais'},
                    {sigla: 'PA', id: '014', state: 'Para'},
                    {sigla: 'PB', id: '015', state: 'Paraiba'},
                    {sigla: 'PR', id: '016', state: 'Parana'},
                    {sigla: 'PE', id: '017', state: 'Pernambuco'},
                    {sigla: 'PI', id: '018', state: 'Piaui'},
                    {sigla: 'RJ', id: '019', state: 'Rio de Janeiro'},
                    {sigla: 'RN', id: '020', state: 'Rio Grande do Norte'},
                    {sigla: 'RS', id: '021', state: 'Rio Grande do Sul'},
                    {sigla: 'RO', id: '022', state: 'Rondonia'},
                    {sigla: 'RR', id: '023', state: 'Roraima'},
                    {sigla: 'SC', id: '024', state: 'Santa Catarina'},
                    {sigla: 'SP', id: '025', state: 'Sao Paulo'},
                    {sigla: 'SE', id: '026', state: 'Sergipe'},
                    {sigla: 'TO', id: '027', state: 'Tocantins'}
                ];
            return states.filter(function (e) {
                return e.sigla == sigla;
            })[0];
        }

        $scope.handleMaps = function (value) {
            var cloudering = document.getElementById("map");
            var markers = document.getElementById("map-markes");
            if (cloudering.style.display === "none") {
                cloudering.style.display = "block";
                markers.style.display = "none";
                $scope.showMessageMap = $scope.showMessageMap;
            } else {
                cloudering.style.display = "none";
                markers.style.display = "block";
                $scope.showMessageMap = 'Ver agrupado';
            }
        };

        Platform.whenReady(function () {
            $scope.ready = true;

            console.log(Identity);

            //mapa fusion
            if (Identity.getCurrentUser().type == "gestor_nacional") {
                $scope.initFusionChartMap();
            }
            if (Identity.getCurrentUser().type == "coordenador_estadual" || Identity.getCurrentUser().type == "gestor_estadual") {
                var scope_uf = "maps/" + returnStateByIDFusionMap(Identity.getCurrentUser().uf).state.split(" ").join("").toLowerCase();
                $scope.initFusionChartMapState(Identity.getCurrentUser().uf, scope_uf);
            }
            //----------

        });

        function init() {
            $scope.states.length = 0;
            for (var i = 0; i < $scope.stateCount; i++) {
                $scope.states.push({
                    name: 'Step ' + (i + 1).toString(),
                    heading: 'Step ' + (i + 1).toString(),
                    isVisible: true
                });
            }
            $scope.initStatusBar();
        };

        init();

    });

})();