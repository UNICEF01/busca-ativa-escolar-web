(function() {

	angular.module('BuscaAtivaEscolar').controller('ReportsCtrl', function ($scope, $rootScope, MockData, Identity) {

		$rootScope.section = 'reports';
		$scope.identity = Identity;

		$scope.reports = {
			cases: {
				id: 'cases',
				name: 'Casos',
				value: 'num_cases',
				dimensions: {
					children_status: {id: 'children_status', values: ['Fora da escola', 'Dentro da escola em observação', 'Dentro da escola consolidado']},
					process_status: {id: 'process_status', values: ['Em andamento', 'Em atraso']},
					case_step: {id: 'case_step', values: ['Alerta', 'Pesquisa', 'Análise Técnica', 'Gestão do Caso', 'Rematrícula', '1a Observação', '2a Observação', '3a Observação', '4a Observação']},
					age: {id: 'age', values: ['4 e 5', '6 a 10', '11 a 14', '15 a 17', '18+']},
					gender: {id: 'gender', values: ['Masculino', 'Feminino']},
					family_income: {id: 'family_income', values: ['Até ¼', 'Mais de ¼ a ½', 'Mais de ½ a 1', 'Mais de 1 a 2', 'Mais de 2']},
					region: {id: 'region', values: ['Urbana', 'Rural']},
					parent_scholarity: {id: 'parent_scholarity', values: ['Nenhuma', 'Ensino fundamental completo', 'Ensino fundamental incompleto', 'Ensino médio completo', 'Ensino médio incompleto', 'Ensino superior completo', 'Ensino superior incompleto', 'Pós graduação']},
					cause: {id: 'cause', values: MockData.searchReasons}
				},
				filters: ['age', 'gender', 'ethnicity', 'family_income', 'parent_scholarity','case_status', 'region', 'case_step', 'uf', 'city', 'children_status', 'process_status', 'search_causes'],
				views: ['map', 'chart', 'timeline', 'list']
			},
			alerts: {
				id: 'alerts',
				name: 'Alertas',
				value: 'num_alerts',
				dimensions: {
					alert_status: {id: 'alert_status', values: ['Procedente', 'Improcedente']},
					process_status: {id: 'process_status', values: ['Em andamento', 'Em atraso']},
					cause: {id: 'cause', values: MockData.alertReasons}
				},
				filters: ['age', 'gender', 'assigned_user', 'uf', 'city', 'alert_status', 'alert_causes', 'process_status'],
				views: ['map', 'chart', 'timeline', 'list']
			},
			/*users: {
				id: 'users',
				name: 'Usuários',
				value: 'num_assignments',
				dimensions: {
					children_status: {id: 'children_status', values: ['Fora da escola', 'Dentro da escola em observação', 'Dentro da escola consolidado']},
					process_status: {id: 'process_status', values: ['Em andamento', 'Em atraso']},
					case_step: {id: 'case_step', values: ['Alerta', 'Pesquisa', 'Análise Técnica', 'Gestão do Caso', 'Rematrícula', '1a Observação', '2a Observação', '3a Observação', '4a Observação']},
				},
				filters: ['children_status', 'process_status', 'case_step', 'user_group', 'user_type'],
				views: ['chart', 'timeline', 'list']
			}*/
		};

		$scope.views = {
			map: {id: 'map', name: 'Mapa', allowsDimension: false},
			chart: {id: 'chart', name: 'Gráfico', allowsDimension: true},
			timeline: {id: 'timeline', name: 'Linha do tempo', allowsDimension: true},
			list: {id: 'list', name: 'Lista', allowsDimension: true}
		};

		$scope.values = {
			num_cases: 'Número de casos',
			num_alerts: 'Número de alertas',
			num_assignments: 'Número de casos sob sua responsabilidade'
		};

		$scope.fields = {
			children_status: 'Status da criança',
			process_status: 'Status do andamento',
			alert_status: 'Status do alerta',
			case_step: 'Etapa do caso',
			age: 'Faixa etária',
			gender: 'Sexo',
			family_income: 'Faixa de renda familiar',
			region: 'Região',
			economic_activity: 'Atividade econômica',
			cause: 'Causa',
			user_group: 'Grupo do usuário',
			user_type: 'Tipo do usuário',
			assigned_user: 'Usuário responsável',
			parent_scholarity: 'Escolaridade do responsável',
			uf: 'Estado',
			city: 'Município',
		};

		$scope.current = {
			entity: $scope.reports.cases,
			dimension: $scope.reports.cases.dimensions.cause,
			view: $scope.views.chart
		};

		$scope.chartConfig = getChartConfig();

		$scope.onParametersUpdate = function() {
			// Regenerate chart config based on view
			if($scope.current.view.id != "list") {
				$scope.chartConfig = getChartConfig();
			}

			// Check if selected view is available in entity
			if($scope.current.entity.views.indexOf($scope.current.view.id) == -1) {
				$scope.current.view = $scope.views[$scope.current.entity.views[0]];
			}

			// Check if selected dimension is available in entity
			var availableDimensions = Object.keys($scope.current.entity.dimensions);
			if(availableDimensions.indexOf($scope.current.dimension.id) == -1) {
				$scope.current.dimension = $scope.current.entity.dimensions[availableDimensions[0]];
			}
		};

		$scope.generateRandomNumber = function(min, max) {
			return min + Math.floor( Math.random() * (max - min));
		};

		$scope.canFilterBy = function(filter_id) {
			return $scope.current.entity.filters.indexOf(filter_id) != -1;
		};

		function getChartConfig() {
			if($scope.current.view.id == "chart") return generateDimensionChart($scope.current.entity, $scope.current.dimension);
			if($scope.current.view.id == "timeline") return generateTimelineChart($scope.current.entity, $scope.current.dimension);
			if($scope.current.view.id == "map") return MockData.brazilMapSettings;
			return {};
		}

		function generateDimensionChart(entity, dimension) {

			var dimensionData = [];
			for(var i = 0; i < dimension.values.length; i++) {
				dimensionData.push( 100 + (Math.ceil( Math.random() * 250 )));
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
					categories: dimension.values,
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
				series: [
					{
						name: $scope.values[entity.value],
						data: dimensionData
					}
				]
			};
		}

		function generateTimelineChart(entity, dimension, numDays) {

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

	});

})();