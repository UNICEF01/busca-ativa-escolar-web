(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('ConfirmLargeModalCtrl', function ConfirmModalCtrl($scope, $q, $uibModalInstance, message, details, canDismiss) {

            $scope.message = message;
            $scope.details = details;
            $scope.canDismiss = canDismiss;

            $scope.agree = function() {
                $uibModalInstance.close(true);
            };

            $scope.disagree = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();