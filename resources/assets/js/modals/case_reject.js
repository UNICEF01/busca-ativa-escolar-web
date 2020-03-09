(function () {

    angular
        .module('BuscaAtivaEscolar')
        .controller('CaseRejectModalCtrl', function CaseRestartModalCtrl($scope, $q, $uibModalInstance) {

            $scope.reject_reason = "";
            $scope.ok = function () {
                if (!$scope.reason) return;
                $uibModalInstance.close(
                    {
                        response:
                            {
                                reason: $scope.reason,
                            }
                    });
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss(false);
            };

        });

})();