(function () {

    angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($scope, $http, moment, Platform, Identity, StaticData, Tenants, Reports, Graph, Charts) {

        $scope.identity = Identity;
        $scope.static = StaticData;
        $scope.tenantInfo = Tenants.getSettings();
        $scope.tenants = [];


        $scope.query = angular.merge({}, $scope.defaultQuery);
        $scope.search = {};


// Todo Criar um serviço para reaproveitar isso
        $scope.getUFs = function () {
            return StaticData.getUFs();
        };

        $scope.getData = function () {
            var jsonify = res => res.json();

            var dataFetch = fetch(
                "mock/data.json"
            ).then(jsonify);
            var schemaFetch = fetch(
                "mock/schema.json"
            ).then(jsonify);

            $scope.dataSource = {
                chart: {},
                caption: {
                    text: "Evolução (Re)Matrículas"
                },
                subcaption: {
                    text: "desde 2015"
                },
                series: "City",
                yaxis: [
                    {
                        plot: [
                            {
                                value: "Unemployment",
                                type: "column"
                            },

                        ],
                        title: "(Re)Matrículas",
                        format: {
                            suffix: "K"
                        },
                        referenceline: [
                            {
                                label: "Meta Selo UNICEF",
                                value: "10",
                                // style: {
                                //     marker: {
                                //         "stroke-dasharray": [4, 3]
                                //     }
                                // }
                            }
                        ]
                    }
                    // {
                    //     plot: "Unemployment",
                    //     title: "Temperature",
                    //     format: {
                    //         suffix: "°C"
                    //     },
                    //     referenceline: [
                    //         {
                    //             label: "Controlled Temperature",
                    //             value: "10",
                    //             style: {
                    //                 marker: {
                    //                     "stroke-dasharray": [4, 3]
                    //                 }
                    //             }
                    //         }
                    //     ]
                    // }
                ]
                // yaxis: [
                //     {
                //         plot: "Temperature",
                //         title: "Temperature",
                //         format: {
                //             suffix: "°C"
                //         },
                //         referenceline: [
                //             {
                //                 label: "Controlled Temperature",
                //                 value: "10",
                //                 style: {
                //                     marker: {
                //                         "stroke-dasharray": [4, 3]
                //                     }
                //                 }
                //             }
                //         ]
                //     },
                //     // {
                //     //     plot: [
                //     //         {
                //     //             value: "Quantidade",
                //     //             type: "column"
                //     //         },
                //     //         {
                //     //             value: "Meta",
                //     //             type: "line"
                //     //         }
                //     //     ]
                //     // }
                // ]
            };

            Promise.all([dataFetch, schemaFetch]).then(res => {
                const data = res[0];
                const schema = res[1];
                const fusionTable = new FusionCharts.DataStore().createDataTable(
                    data,
                    schema
                );
                $scope.$apply(function () {
                    $scope.dataSource.data = fusionTable;
                });
            });
        }
        $scope.getData();

        $scope.atualizaDash = function () {
            $scope.tenants = Tenants.findByUfPublic({'uf': $scope.query.uf});
            $scope.getData();
        };

        $scope.refresh = function () {
            // $scope.getData();
            if (($scope.query.uf !== undefined) && ($scope.query.tenant_id !== undefined)) {
                $scope.tenants = Graph.getReinsertEvolution({'uf': $scope.query.uf});
            }

        };


        $scope.getTenants = function () {
            if (!$scope.tenants || !$scope.tenants.data) return [];
            return $scope.tenants.data;
        };

        // function dataGenerate() {
        // $http({
        //     method: 'GET',
        //     url: 'mock/data.json'
        // }).then(function (response) {
        //     var novo = [];
        //
        //     for (var i = 0; i < response.data.length; i++) {
        //         var value = response.data[i];
        //         value[2] = "20000";
        //         novo.push(value);
        //     }
        //     $scope.jsonexit = novo;
        // }, function (error) {
        //     console.log('error');
        // });

        // }

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