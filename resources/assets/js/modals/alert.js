(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('AlertModalCtrl', function AlertModalCtrl($scope, $uibModalInstance, message, details) {

            $scope.message = message;
            $scope.details = details;

            $scope.dismiss = function() {
                $uibModalInstance.dismiss();
            };

        });

})();