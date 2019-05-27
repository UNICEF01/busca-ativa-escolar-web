(function() {
	angular.module('BuscaAtivaEscolar')
		.controller('ImportXLSChildrenCtrl', function ($scope, $window, Modals, API, Tenants, ngToast) {

			$scope.refresh = function() {
				console.log("refresh...");
			};

			$scope.beginImport = function() {
				Modals.show(Modals.FileUploader(
					'Enviar planilha com casos',
					'Selecione a planilha com os dados das crianças/ adolescentes a serem importados. O arquivo precisar estar exatamente igual ao exemplo disponível aqui na plataforma. ',
					API.getURI('settings/import/xls')
				)).then(function (file) {

					if(file.status == "error"){

						ngToast.danger('Erro na importação! '+ file.reason);
						$scope.hasImported = false;
						$scope.refresh();

					}else{

						ngToast.success('Arquivo encaminhado para fila de processamento');
						$scope.hasImported = true;
						$scope.refresh();
					}

				});
			};

			$scope.refresh();

		});

})();