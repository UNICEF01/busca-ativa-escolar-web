(function () {
    angular.module('BuscaAtivaEscolar')
        .controller('ImportXLSChildrenCtrl', function ($scope, Modals, API, Tenants, ngToast) {

            $scope.jobs = null;

            $scope.refresh = function () {
                Tenants.getXlsChildrenJobs(function (res) {
                    $scope.jobs = res.data;
                });
            };

            $scope.beginImport = function (type) {
                Modals.show(Modals.FileUploader(
                    'Enviar planilha com casos',
                    'Selecione a planilha com os dados das crianças/ adolescentes a serem importados. O arquivo precisar estar exatamente igual ao exemplo disponível aqui na plataforma. ',
                    API.getURI('settings/import/xls'),
                    { type: type }
                )).then(function (file) {

                    if (file.status == "error") {

                        ngToast.danger('Erro na importação! ' + file.reason);
                        $scope.refresh();

                    } else {

                        ngToast.warning('Arquivo encaminhado para fila de processamento');
                        $scope.refresh();
                    }

                });
            };

            $scope.refresh();

        });

})();