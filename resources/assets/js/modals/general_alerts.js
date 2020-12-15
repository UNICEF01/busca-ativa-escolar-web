(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('GeneralAlertsModalCtrl', function GeneralAlertsModalCtrl($scope, $q, $uibModalInstance, message, canDismiss) {

            $scope.message = message;
            $scope.canDismiss = canDismiss;

            $scope.agree = function() {
                $uibModalInstance.close(true);
            };

            $scope.disagree = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();