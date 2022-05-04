(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('DownloadLinkModalCtrl', function ConfirmModalCtrl($scope, $uibModalInstance, title, message, href) {

            $scope.title = title;
            $scope.message = message;
            $scope.href = href;

            $scope.back = function() {
                $uibModalInstance.dismiss(false);
            };

        });

})();