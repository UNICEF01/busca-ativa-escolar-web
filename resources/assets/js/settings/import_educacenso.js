(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ImportEducacensoCtrl', function ($scope, Modals, API, Tenants, ngToast) {

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
					console.log("File uploaded: ", file);
					ngToast.success('Arquivo anexado!');
					$scope.hasImported = true;

					$scope.refresh();
				});
			};

			$scope.refresh();

		});

})();