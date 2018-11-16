(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('child_browser', {
				url: '/children',
				templateUrl: '/views/children/browser.html',
				controller: 'ChildSearchCtrl'
			});
		})
		.controller('ChildSearchCtrl', function ($scope, $anchorScroll, $httpParamSerializer, API, Children, Decorators, Modals, DTOptionsBuilder, DTColumnBuilder) {

			$scope.Decorators = Decorators;
			$scope.Children = Children;

          $scope.defaultQuery = {
				name: '',
				step_name: '',
				cause_name: '',
				assigned_user_name: '',
				location_full: '',
				alert_status: ['accepted'],
				case_status: ['in_progress'],
				risk_level: ['low','medium','high'],
				age: {from: 0, to: 28},
				age_null: true,
				gender: ['male', 'female', 'undefined'],
				gender_null: true,
				place_kind: ['rural','urban'],
				place_kind_null: true,
			};


			$scope.query = angular.merge({}, $scope.defaultQuery);
			$scope.search = {};

			$scope.refresh = function() {
				$scope.search = Children.search($scope.query);
				$anchorScroll('#');
			};

			$scope.resetQuery = function() {
				$scope.query = angular.merge({}, $scope.defaultQuery);
				$scope.refresh();
			};

			$scope.exportXLS = function() {
				Children.export($scope.query, function (res) {
					console.log("Exported: ", res);
					Modals.show(Modals.DownloadLink('Baixar arquivo XLS', 'Clique no link abaixo para baixar os casos exportados:', res.download_url));
				});
			};
			$scope.refresh();

          var language = {
            "sEmptyTable": "Nenhum registro encontrado",
            "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
            "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
            "sInfoFiltered": "(Filtrados de _MAX_ registros)",
            "sInfoPostFix": "",
            "sInfoThousands": ".",
            "sLengthMenu": "_MENU_ resultados por página",
            "sLoadingRecords": "Carregando...",
            "sProcessing": "Processando...",
            "sZeroRecords": "Nenhum registro encontrado",
            "sSearch": "Pesquisar",
            "oPaginate": {
              "sNext": "Próximo",
              "sPrevious": "Anterior",
              "sFirst": "Primeiro",
              "sLast": "Último"
            },
            "oAria": {
              "sSortAscending": ": Ordenar colunas de forma ascendente",
              "sSortDescending": ": Ordenar colunas de forma descendente"
            }
          }

          $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withLanguage(language);
		});
})();