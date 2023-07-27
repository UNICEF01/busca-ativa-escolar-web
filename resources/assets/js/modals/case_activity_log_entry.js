(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('CaseActivityLogEntryCtrl', function CaseActivityLogEntryCtrl($scope, $uibModalInstance) {

            // TODO: receive case ID, fetch details and show


            $scope.close = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();