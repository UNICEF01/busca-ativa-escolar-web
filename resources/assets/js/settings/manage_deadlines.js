(function() {

    angular.module('BuscaAtivaEscolar')
        .controller('ManageDeadlinesCtrl', function($scope, ngToast, Platform, Tenants, StaticData) {

            $scope.static = StaticData;
            $scope.tenantSettings = {};

            $scope.save = function() {

                Tenants.updateSettings($scope.tenantSettings).$promise.then(
                    function() {

                        ngToast.success('Configurações salvas com sucesso!');
                        $scope.refresh();
                    },
                    function() {

                        ngToast.danger('Ocorreu um erro ao atualizar as configurações');
                    }
                );

            };

            $scope.refresh = function() {
                Tenants.getSettings(function(res) {

                    $scope.tenantSettings = res;
                });
            };

            Platform.whenReady(function() {
                $scope.refresh();
            })

        });

})();