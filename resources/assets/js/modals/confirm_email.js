(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('ConfirmEmailModalCtrl', function ConfirmEmailModalCtrl($scope, $uibModalInstance, message, details, schools, canDismiss) {

            $scope.message = message;
            $scope.details = details;
            $scope.schools = schools;
            $scope.canDismiss = canDismiss;

            $scope.agree = function() {
                $uibModalInstance.close(true);
            };

            $scope.disagree = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();