(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function($stateProvider) {
			$stateProvider.state('reports', {
				url: '/reports',
				templateUrl: '/views/reports/reports.html',
				controller: 'ReportViewerCtrl'
			})
		})
		.controller('ReportViewerCtrl', function ($scope, $rootScope, Platform, Utils, Cities, StaticData, Reports, Identity) {

			$scope.identity = Identity;
			$scope.static = StaticData;

			$scope.ready = false;

			$scope.filters = {};
			$scope.entities = {};
			$scope.views = {};
			$scope.totals = {};
			$scope.fields = {};

			$scope.reportData = {};

			$scope.current = {
				entity: 'children',
				dimension: 'cause',
				view: 'chart'
			};

			function onInit() {
				$scope.ready = true;

				$scope.filters = {
					//deadline_status: ['normal', 'delayed'],
					case_status: ['in_progress', 'cancelled', 'completed', 'interrupted'],
					alert_status: ['accepted'],
					child_status: ['in_school', 'in_observation', 'out_of_school'],
					age: {from: 0, to: 28},
					age_null: true,
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
						dimensions: ['child_status', 'step_slug', 'age', 'gender', 'parents_income', 'place_kind', 'work_activity', 'case_cause_ids', 'place_uf', 'place_city_id', 'school_last_id'],
						filters: [
							'case_status',
							'child_status',
							'alert_status',
							//'deadline_status', // TODO: implement in backend/searchdoc
							'age',
							'gender',
							//'race',
							//'parents_income',
							//'guardian_schooling',
							//'work_activity',
							'place_kind',
							'step_slug',
							//'uf',
							//'city',
							//'deadline_status',
							'case_cause_ids'
						],
						views: ['chart', 'list']//['map', 'chart', 'timeline', 'list']
					}/*,
					 alerts: {
					 id: 'alerts',
					 name: 'Alertas',
					 value: 'num_alerts',
					 dimensions: ['alert_status', 'deadline_status', 'alert_cause_id'],
					 filters: ['age', 'gender', 'assigned_user', 'uf', 'city', 'alert_status', 'child_status', 'deadline_status'],
					 views: ['map', 'chart', 'timeline', 'list']
					 },
					 users: {
					 id: 'users',
					 name: 'Usuários',
					 value: 'num_assignments',
					 dimensions: ['child_status', 'deadline_status', 'case_step'],
					 filters: ['child_status', 'deadline_status', 'case_step', 'user_group', 'user_type'],
					 views: ['chart', 'timeline', 'list']
					 }*/
				};

				$scope.views = {
					map: {id: 'map', name: 'Mapa', allowsDimension: false, viewMode: 'linear'},
					chart: {id: 'chart', name: 'Gráfico', allowsDimension: true, viewMode: 'linear'},
					timeline: {id: 'timeline', name: 'Linha do tempo', allowsDimension: true, viewMode: 'time_series'},
					list: {id: 'list', name: 'Lista', allowsDimension: true, viewMode: 'linear'}
				};

				$scope.totals = {
					num_children: 'Número de crianças e adolescentes',
					num_alerts: 'Número de alertas',
					num_assignments: 'Número de casos sob sua responsabilidade'
				};

				$scope.fields = {
					child_status: 'Status da criança',
					deadline_status: 'Status do andamento',
					alert_status: 'Status do alerta',
					step_slug: 'Etapa do caso',
					age: 'Faixa etária',
					gender: 'Sexo',
					parents_income: 'Faixa de renda familiar',
					place_kind: 'Região',
					work_activity: 'Atividade econômica',
					case_cause_ids: 'Causa do Caso',
					alert_cause_id: 'Causa do Alerta',
					user_group: 'Grupo do usuário',
					user_type: 'Tipo do usuário',
					assigned_user: 'Usuário responsável',
					parent_scholarity: 'Escolaridade do responsável',
					place_uf: 'UF',
					place_city_id: 'Município',
					school_last_id: 'Última escola que frequentou',
					city: 'Município',
				};

				$scope.chartConfig = getChartConfig();

				$scope.refresh();
			};

			$scope.refresh = function() {

				// Check if selected view is available in entity
				if($scope.entities[$scope.current.entity].views.indexOf($scope.current.view) === -1) {
					$scope.current.view = $scope.current.entity.views[0];
				}

				// Check if selected dimension is available in entity
				var availableDimensions = $scope.entities[$scope.current.entity].dimensions;
				if(availableDimensions.indexOf($scope.current.dimension) === -1) {
					$scope.current.dimension = availableDimensions[0];
				}

				fetchReportData().then(function (res) {

					if($scope.current.view !== "list") {
						$scope.chartConfig = getChartConfig();
					}

				});

			};

			function fetchReportData() {

				var params = Object.assign({}, $scope.current);
				params.view = $scope.views[$scope.current.view].viewMode;
				params.filters = $scope.filters;

				params.filters.place_city_id = (params.filters.place_city) ? params.filters.place_city.id : null;

				$scope.reportData = Reports.query(params);

				return $scope.reportData.$promise;
			}

			$scope.generateRandomNumber = function(min, max) {
				return min + Math.floor( Math.random() * (max - min));
			};

			$scope.canFilterBy = function(filter_id) {
				if(!$scope.ready) return false;

				if(filter_id === 'period') {
					return $scope.current.view === 'timeline';
				}

				return $scope.entities[$scope.current.entity].filters.indexOf(filter_id) !== -1;
			};

			$scope.fetchCities = function(query) {
				var data = {name: query, $hide_loading_feedback: true};
				if($scope.filters.place_uf) data.uf = $scope.filters.place_uf;

				console.log("[create_alert] Looking for cities: ", data);

				return Cities.search(data).$promise.then(function (res) {
					return res.results;
				});
			};

			$scope.renderSelectedCity = function(city) {
				return city.uf + ' / ' + city.name;
			};

			function getChartConfig() {
				if($scope.current.view === "chart") return generateDimensionChart($scope.current.entity, $scope.current.dimension);
				if($scope.current.view === "timeline") return generateTimelineChart($scope.current.entity, $scope.current.dimension);
				//if($scope.current.view.id == "map") return MockData.brazilMapSettings;
				return {};
			}

			function generateDimensionChart(entity, dimension) {

				if(!$scope.ready) return false;

				console.log("[report.charts] Generating dimension chart: ", entity, dimension, $scope.reportData);

				if(!$scope.reportData) return;
				if(!$scope.reportData.$resolved) return;
				if(!$scope.reportData.response) return;
				if(!$scope.reportData.response.report) return;

				var report = $scope.reportData.response.report;
				var seriesName = $scope.totals[$scope.entities[entity].value];
				var labels = $scope.reportData.labels ? $scope.reportData.labels : {};

				var data = [];
				var categories = [];

				for(var i in report) {
					if(!report.hasOwnProperty(i)) continue;

					var category = (labels[i]) ? labels[i] : i;

					data.push( report[i] );
					categories.push( category );

				}

				return {
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
						categories: categories,
						title: {
							text: null
						}
					},
					yAxis: {
						min: 0,
						title: {
							text: 'Quantidade',
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
					series: [
						{
							name: seriesName,
							data: data
						}
					]
				};
			}

			function generateTimelineChart(entity, dimension, numDays) {

				return;

				if(!numDays) numDays = 30;
				var series = [];

				for(var d in dimension.values) {
					if(!dimension.values.hasOwnProperty(d)) continue;

					series.push({
						name: dimension.values[d],
						data: []
					});
				}

				var settings = {
					options: {
						chart: {
							type: 'line'
						},

						xAxis: {
							currentMin: 1,
							currentMax: 30,
							title: {text: 'Últimos ' + numDays + ' dias'},
							allowDecimals: false
						},

						yAxis: {
							title: {text: $scope.values[entity.value]}
						}
					},
					series: series,
					title: {
						text: ''
					},

					loading: false
				};

				for(var i = 0; i < numDays; i++) {
					for(var j in series) {
						if(!series.hasOwnProperty(j)) continue;
						settings.series[j].data.push(Math.floor(100 + (j * 15) + (Math.random() * (numDays / 2))));
					}
				}

				return settings;
			}

			Platform.whenReady(onInit); // Must be the last call, since $scope functions are not hoisted to the top

		});

})();