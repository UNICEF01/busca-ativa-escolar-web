(function() {

	angular.module('BuscaAtivaEscolar').directive('evolutionGraph', function (moment, Platform, Reports, Report, Charts, Identity, Tenants, StaticData, Config) {
		
		function init(scope, element, attrs) {

			var metrics = {};

			scope.static = StaticData;

			scope.options_selo =['TODOS', 'PARTICIPA DO SELO', 'NÃO PARTICIPA DO SELO'];

			scope.query_evolution_graph = {
				uf: '',
				tenant_id: '',
				selo: 'TODOS'
			};

			scope.schema = [
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

			scope.dataSource = {
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

			scope.getUFs = function () {
				return StaticData.getUFs();
			};

			scope.getData = function () {

				Identity.provideToken().then(function (token) {

					var jsonify = function (res) { return res.json(); }

					var dataDaily = fetch(Config.getAPIEndpoint() + 'reports/data_rematricula_daily?uf='+scope.query_evolution_graph.uf+'&tenant_id='+scope.query_evolution_graph.tenant_id+'&selo='+scope.query_evolution_graph.selo+'&token=' + token).then(jsonify);

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

							scope.schema
						);
						scope.$apply(function () {

							if( data.selo == "PARTICIPA DO SELO" && data.goal > 0) {
								scope.dataSource.yaxis[0].Max = data.goal;
								scope.dataSource.yaxis[0].referenceline[0].label = "Meta Selo UNICEF";
								scope.dataSource.yaxis[0].referenceline[0].value = data.goal;
							}

							if( data.selo == "NÃO PARTICIPA DO SELO" || data.selo == "TODOS") {
								scope.dataSource.yaxis[0].Max = 0;
								scope.dataSource.yaxis[0].referenceline[0] = {};
							}

							scope.dataSource.data = fusionTable;
						});

						scope.initTenants();
					});

				});
			}

			scope.initTenants = function(){
				if (Identity.getType() === 'coordenador_estadual') {
					scope.tenants = Tenants.findByUfPublic({'uf': scope.identity.getCurrentUser().uf});
				}
			};

			scope.atualizaDash = function () {
				scope.tenants = Tenants.findByUfPublic({'uf': scope.query_evolution_graph.uf});
				scope.getData();
			};

			scope.onSelectCity = function () {
				scope.getData();
			};

			scope.refresh = function () {
				if ((scope.query.uf !== undefined) && (scope.query.tenant_id !== undefined)) {
					scope.tenants = Graph.getReinsertEvolution({'uf': scope.query.uf});
				}
			};

			scope.getTenants = function () {
				if (!scope.tenants || !scope.tenants.data) return [];
				return scope.tenants.data;
			};


		}

		return {
			link: init,
			replace: true,
			templateUrl: '/views/dashboards/grafico_evolucao_rematriculas.html'
		};
	});

})();