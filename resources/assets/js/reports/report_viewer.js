(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('reports', {
                url: '/reports',
                templateUrl: '/views/reports/reports.html',
                controller: 'ReportViewerCtrl'
            })
        })
        .controller('ReportViewerCtrl', function ($scope, $rootScope, moment, Platform, Modals, Utils, Cities, StaticData, Language, Reports, Identity, Charts, ngToast) {

            $scope.identity = Identity;
            $scope.static = StaticData;
            $scope.lang = Language;
            $scope.ready = false;

            $scope.filters = {};
            $scope.entities = {};
            $scope.views = {};
            $scope.totals = {};
            $scope.fields = {};

            $scope.sort = 'maxToMin';

            $scope.reportData = {};

            $scope.current = {
                entity: 'children',
                dimension: 'cause',
                view: 'chart'
            };

            $scope.avaliable_graph = true;

            $scope.showGraph = function () {
                return $scope.avaliable_graph;
            };

            function onInit() {
                $scope.ready = true;
                
                var lastWeek = moment().subtract(7, 'days').toDate();
                var today = moment().toDate();

                $scope.filters = {
                    //case_status: ['in_progress', 'cancelled', 'completed', 'interrupted'],
                    alert_status: ['accepted'],
                    child_status: ['in_school', 'in_observation', 'out_of_school', 'cancelled', 'interrupted'],
                    age: {from: 0, to: 2000},
                    age_ranges: [
                        '0-3',
                        '4-5',
                        '6-10',
                        '11-14',
                        '15-17',
                        '18',
                    ],
                    age_null: true,
                    school_last_grade: null,
                    school_last_grade_null: true,
                    gender: Utils.pluck(StaticData.getGenders(), 'slug'), //['male', 'female', 'undefined'],
                    gender_null: true,
                    race: Utils.pluck(StaticData.getRaces(), 'slug'), //['male', 'female', 'undefined'],
                    race_null: true,
                    place_kind: ['rural', 'urban'],
                    place_kind_null: true
                };

                $scope.entities = {
                    children: {
                        id: 'children',
                        name: 'Crianças e adolescentes',
                        value: 'num_children',
                        entity: 'children',
                        dimensions: ['child_status', 'step_slug', 'age', 'gender', 'parents_income', 'place_kind', 'work_activity', 'case_cause_ids', 'alert_cause_id', 'uf', 'place_uf', 'city_id', 'place_city_id', 'school_last_id', 'race', 'guardian_schooling', 'country_region'],
                        filters: [
                            // 'date',
                            //'case_status',
                            'child_status',
                            'alert_status',
                            'age_ranges',
                            'gender',
                            'place_kind',
                            'school_last_grade',
                            'step_slug',
                            'uf',
                            'city',
                            'case_cause_ids'
                        ],
                        views: ['chart', 'timeline']
                    }
                };

                if (Identity.can('reports.tenants')) {
                    $scope.entities.tenants = {
                        id: 'tenants',
                        name: 'Municípios participantes',
                        value: 'num_tenants',
                        entity: 'tenant',
                        dimensions: ['uf', 'region'],
                        filters: ['uf'],
                        views: ['chart']
                    };
                }

                if (Identity.can('reports.ufs')) {
                    $scope.entities.ufs = {
                        id: 'ufs',
                        name: 'Estados participantes',
                        value: 'num_ufs',
                        entity: 'uf',
                        dimensions: ['uf', 'region'],
                        filters: [],
                        views: ['chart']
                    };
                }

                if (Identity.can('reports.signups')) {
                    $scope.entities.signups = {
                        id: 'signups',
                        name: 'Adesões municipais',
                        value: 'num_signups',
                        entity: 'signup',
                        dimensions: ['month'],
                        filters: [],
                        views: ['timeline']
                    };
                }

                $scope.views = {
                    map: {id: 'map', name: 'Mapa', allowsDimension: false, viewMode: 'linear'},
                    chart: {id: 'chart', name: 'Gráfico', allowsDimension: true, viewMode: 'linear'},
                    timeline: {id: 'timeline', name: 'Linha do tempo', allowsDimension: true, viewMode: 'time_series'}
                };

                $scope.totals = {
                    num_children: 'Número de crianças e adolescentes',
                    num_tenants: 'Número de municípios participantes',
                    num_ufs: 'Número de estados participantes',
                    num_signups: 'Número de adesões municipais',
                    num_alerts: 'Número de alertas',
                    num_assignments: 'Número de casos sob sua responsabilidade'
                };

                $scope.fields = {
                    // period: 'Período',
                    //case_status: 'Status do caso',
                    child_status: 'Status do caso',
                    deadline_status: 'Status do andamento',
                    alert_status: 'Status do alerta',
                    step_slug: 'Etapa do caso',
                    age: 'Faixa etária',
                    age_ranges: 'Faixa etária',
                    gender: 'Sexo',
                    parents_income: 'Faixa de renda familiar',
                    place_kind: 'Zona Rural/ Urbana',
                    work_activity: 'Atividade econômica',
                    case_cause_ids: 'Motivo do Caso',
                    alert_cause_id: 'Motivo do Alerta',
                    school_last_grade: 'Último ano cursado',
                    user_group: 'Grupo do usuário',
                    user_type: 'Tipo do usuário',
                    assigned_user: 'Usuário responsável',
                    parent_scholarity: 'Escolaridade do responsável',
                    place_uf: 'UF da localização da criança',
                    uf: 'UF da adesão',
                    region: 'Região',
                    city_id: 'Município da adesão',
                    place_city_id: 'Município da localização da criança',
                    school_last_id: 'Última escola que frequentou',
                    city: 'Município da adesão',
                    month: 'Mês',
                    race: 'Raça / Etnia',
                    guardian_schooling: 'Escolaridade do responsável',
                    country_region: "Região geográfica"
                };

                $scope.chartConfig = getChartConfig();

                $scope.refresh();
            };

            $scope.clearFilter = function (name) {
                $scope.filters[name] = null;
            };

			/**
			 * * @param model
			 * Marca e desmarca de forma sincronizada os campos cancelado e interrompido do filtro child_status e case_status
			 */
            $scope.checkChild = function (model) {
                var i = _.findIndex($scope.filters.child_status, function (el) {
                    return el === model;
                });
                if (i !== -1) {
                    $scope.filters.child_status.splice(i, 1);
                } else {
                    $scope.filters.child_status.push(model);
                }
            }

            $scope.refresh = function () {

                // Check if selected view is available in entity
                if ($scope.entities[$scope.current.entity].views.indexOf($scope.current.view) === -1) {
                    $scope.current.view = $scope.current.entity.views[0];
                }

                // Check if selected dimension is available in entity
                var availableDimensions = $scope.entities[$scope.current.entity].dimensions;
                if (availableDimensions.indexOf($scope.current.dimension) === -1) {
                    $scope.current.dimension = availableDimensions[0];
                }

                fetchReportData().then(function (res) {

                    if ($scope.current.view !== "list") {
                        $scope.chartConfig = getChartConfig();
                    }

                    //if response has property named 'tenant' set value to $scope.avaliable_graph
                    if (res.response.hasOwnProperty('tenant')) {
                        $scope.avaliable_graph = res.response.tenant;
                        if ($scope.avaliable_graph == false) ngToast.danger('Este município ainda não fez adesão ao Busca Ativa Escolar!');
                    } else {
                        $scope.avaliable_graph = true;
                    }

                    window.scrollTo(1, 1);

                });

            };

            $scope.exportXLS = function () {
                fetchReportData('xls').then(function (res) {
                    console.log("Exported: ", res);
                    Modals.show(Modals.DownloadLink('Baixar arquivo XLS', 'Clique no link abaixo para baixar o relatório exportado:', res.download_url));
                })
            };

            function fetchReportData(format) {

                var params = Object.assign({}, $scope.current);
                params.view = $scope.views[$scope.current.view].viewMode;
                params.filters = $scope.filters;
                params.format = (format ? format : 'json');
                
                params.filters.place_city_id = (params.filters.place_city) ? params.filters.place_city.id : null;

                if (params.format === 'xls') {
                    return Reports.query(params).$promise;
                }

                $scope.reportData = Reports.query(params);

                return $scope.reportData.$promise;
            }

            $scope.generateRandomNumber = function (min, max) {
                return min + Math.floor(Math.random() * (max - min));
            };

            $scope.isUFScoped = function () {
                return Identity.getType() === 'gestor_estadual' || Identity.getType() === 'supervisor_estadual';
            };

            $scope.canFilterBy = function (filter_id) {
                if (!$scope.ready) return false;

                if (filter_id === 'date' && $scope.current.view !== 'timeline') {
                    return false;
                }

                // Is filter valid for entity
                if ($scope.entities[$scope.current.entity].filters.indexOf(filter_id) === -1) {
                    return false;
                }

                if (filter_id === 'uf') {
                    return Identity.getType() === 'gestor_nacional'
                        || Identity.getType() === 'superuser'
                        || Identity.getType() === 'visitante_nacional_1'
                        || Identity.getType() === 'visitante_nacional_2'
                        || Identity.getType() === 'visitante_nacional_3'
                        || Identity.getType() === 'visitante_nacional_4'
                }

                if (filter_id === 'city') {
                    return Identity.getType() === 'gestor_nacional'
                        || Identity.getType() === 'superuser'
                        || Identity.getType() === 'gestor_estadual'
                        || Identity.getType() === 'supervisor_estadual'
                        || Identity.getType() === 'visitante_nacional_1'
                        || Identity.getType() === 'visitante_nacional_2'
                        || Identity.getType() === 'visitante_nacional_3'
                        || Identity.getType() === 'visitante_nacional_4'
                }

                return true;
            };

            $scope.fetchCities = function (query) {
                var data = {name: query, $hide_loading_feedback: true};
                if ($scope.filters.place_uf) data.uf = $scope.filters.place_uf;
                if ($scope.isUFScoped()) data.uf = Identity.getCurrentUser().uf;

                console.log("[create_alert] Looking for cities: ", data);

                return Cities.search(data).$promise.then(function (res) {
                    return res.results;
                });
            };

            $scope.renderSelectedCity = function (city) {
                if (!city) return '';
                return city.uf + ' / ' + city.name;
            };

            function getChartConfig() {
                if ($scope.current.view === "chart") return generateDimensionChart($scope.current.entity, $scope.current.dimension);
                if ($scope.current.view === "timeline") return generateTimelineChart($scope.current.entity, $scope.current.dimension);
                return {};
            }

            function generateDimensionChart(entity, dimension) {

                if (!$scope.ready) return false;

                if (!$scope.reportData) return;
                if (!$scope.reportData.$resolved) return;
                if (!$scope.reportData.response) return;
                if (!$scope.reportData.response.report) return;

                var report = $scope.reportData.response.report;
                var seriesName = $scope.reportData.response.seriesName ? $scope.reportData.response.seriesName : $scope.totals[$scope.entities[entity].value];
                var labels = $scope.reportData.labels ? $scope.reportData.labels : {};

                var sortable = [];
                var objSorted = {};
                var finalLabels = {};

                for (var value in report) {
                    sortable.push([value, report[value]]);
                }

                if($scope.sort == 'minToMax'){
                    sortable.sort(function(a, b) {
                        return a[1] - b[1];
                    });
                }

                if($scope.sort == 'maxToMin'){
                    sortable.sort(function(a, b) {
                        return b[1] - a[1];
                    });
                }

                sortable.forEach(function(item){
                    objSorted["_"+item[0]]=item[1]
                });

                for (var key in labels){
                    finalLabels["_"+key] = labels[key];
                }

                return Charts.generateDimensionChart(objSorted, seriesName, finalLabels);
            }

            function generateTimelineChart(entity, dimension) {
                if (!$scope.ready) return false;

                if (!$scope.reportData) return;
                if (!$scope.reportData.$resolved) return;
                if (!$scope.reportData.response) return;
                if (!$scope.reportData.response.report) return;

                var report = $scope.reportData.response.report;
                var chartName = $scope.totals[$scope.entities[entity].value];
                var labels = $scope.reportData.labels ? $scope.reportData.labels : {};

                return Charts.generateTimelineChart(report, chartName, labels);

            }

            $scope.sumValuesOfReportData = function (object) {
                var final_value = 0;
                for (const property in object) {
                    final_value += object[property];
                }
                return final_value;
            };

            $scope.canShowLabel = function(){
                //can't show:
                var permissions = {
                    gestor_nacional: [],
                    coordenador_operacional: ['uf', 'city_id'],
                    gestor_politico: ['uf', 'city_id'],
                    supervisor_institucional: ['uf', 'city_id'],
                    gestor_estadual: ['place_uf'],
                    coordenador_estadual: ['place_uf'],
                    supervisor_estadual: ['place_uf']
                };

                return function (item) {
                   if ( permissions[Identity.getCurrentUser().type].includes(item)){
                        return false;
                   }else{
                       return true;
                   }
                };

            };

            Platform.whenReady(onInit); // Must be the last call, since $scope functions are not hoisted to the top

            $scope.refresByMinToMax = function () {
                $scope.sort = 'minToMax';
                $scope.refresh();
            };

            $scope.refresByMaxToMin = function () {
                $scope.sort = 'maxToMin';
                $scope.refresh();
            }

        });

})();