(function() {
    angular
        .module('BuscaAtivaEscolar')
        .controller('CloseNotificationModalCtrl', function CloseNotificationModalCtrl($scope, $uibModalInstance) {

            $scope.annotation = "";

            $scope.ok = function() {
                if (!$scope.annotation) return;
                $uibModalInstance.close({
                    response: {
                        annotation: $scope.annotation
                    }
                });
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss(false);
            };

        });
})();