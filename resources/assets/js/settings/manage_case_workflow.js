(function() {

    angular.module('BuscaAtivaEscolar')
        .controller('ManageCaseWorkflowCtrl', function($scope, $q, ngToast, Platform, Tenants, StaticData) {
            $scope.static = StaticData;
            $scope.settings = {};
            $scope.save = function() {
                var promises = [Tenants.updateSettings($scope.settings).$promise];
                $q.all(promises).then(
                    function() {
                        ngToast.success('Configurações salvas com sucesso!');
                        $scope.refresh();
                    },
                    function() {
                        ngToast.danger('Ocorreu um erro ao salvar as configurações!');
                    }
                );
            };
            $scope.refresh = function() {
                Tenants.getSettings(function(res) {
                    $scope.settings = res;
                });
            };
            Platform.whenReady(function() {
                $scope.refresh();
            });
        });
})();