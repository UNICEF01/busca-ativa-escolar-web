(function () {

    angular
        .module('BuscaAtivaEscolar')
        .controller('CaseTransferModalCtrl', function CaseRestartModalCtrl($scope, $q, $uibModalInstance, $typeUser, StaticData, Identity, Tenants, Users) {

            $scope.step = 1;
            $scope.reason = "";
            $scope.typeUser = $typeUser;
            $scope.tenants = [];

            $scope.defaultQuery = {
                name: '',
                step_name: '',
                cause_name: '',
                assigned_user_name: '',
                location_full: '',
                alert_status: ['accepted'],
                case_status: ['in_progress'],
                risk_level: ['low', 'medium', 'high'],
                age_null: true,
                age: {from: 0, to: 10000},
                gender: ['male', 'female', 'undefined'],
                gender_null: true,
                place_kind: ['rural', 'urban'],
                place_kind_null: true,
            };

            $scope.query = angular.merge({}, $scope.defaultQuery);
            $scope.search = {};
// Todo Criar um serviço para reaproveitar isso
            $scope.getUFs = function () {
                return StaticData.getUFs();
            };

            $scope.refresh = function () {
                $scope.tenants = Tenants.findByUfPublic({'uf': $scope.query.uf});
            };

            $scope.getTenants = function () {
                if (!$scope.tenants || !$scope.tenants.data) return [];
                return $scope.tenants.data;
            };

            $scope.ok = function () {
                if (!$scope.reason) return;
                var city = _.find($scope.tenants.data, {id: $scope.query.tenant_id})
                $uibModalInstance.close(
                    {
                        response:
                            {
                                tenant_id: $scope.query.tenant_id,
                                reason: $scope.reason,
                                city: city
                            }
                    });
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss(false);
            };

        });

})();