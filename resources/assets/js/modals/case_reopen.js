(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('CaseReopenModalCtrl', function CaseRestartModalCtrl($scope, $uibModalInstance, $typeUser) {



            $scope.step = 1;
            $scope.reason = "";
            $scope.typeUser = $typeUser;

            $scope.ok = function() {
                if (!$scope.reason) return;
                $uibModalInstance.close({ response: $scope.reason });
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();