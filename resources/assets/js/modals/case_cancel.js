(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('CaseCancelModalCtrl', function CaseCancelModalCtrl($scope, $uibModalInstance, StaticData, Language) {



            $scope.static = StaticData;
            $scope.lang = Language;
            $scope.reason = null;

            $scope.cancelCase = function() {
                if (!$scope.reason) return;
                $uibModalInstance.close({ response: $scope.reason });
            };

            $scope.close = function() {
                $uibModalInstance.dismiss(false);
            }
        });

})();