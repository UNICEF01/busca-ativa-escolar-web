(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ImportEducacensoCtrl', function ($scope, $window, Modals, API, Tenants, ngToast) {

			$scope.hasImported = false;
			$scope.jobs = null;
			$scope.importDetails = false;

			$scope.refresh = function() {
				Tenants.getSettings(function (res) {
					console.log("Settings: ", res);
					$scope.importDetails = res.educacensoImportDetails;
				});

				Tenants.getEducacensoJobs(function (res) {
					console.log("Educacenso Jobs: ", res);
					$scope.jobs = res.data;
				});
			};

			$scope.beginImport = function() {
				Modals.show(Modals.FileUploader(
					'Enviar planilha do Educacenso',
					'Selecione o arquivo de planilha do Educacenso recebido pelo INEP. O arquivo deve estar intacto e sem modificações, exatamente da forma como foi recebido.',
					API.getURI('settings/educacenso/import')
				)).then(function (file) {

					if(file.status == "error"){

						ngToast.danger('Arquivo inválido! '+ file.reason);
                        $scope.hasImported = false;
						$scope.refresh();
						
					}else{

                        ngToast.warning('Arquivo importado com sucesso!');
                        $scope.hasImported = true;
                        $scope.refresh();
					}

				});
			};

			$scope.refresh();

		});

})();