(function () {
  angular
    .module('BuscaAtivaEscolar')
    .controller(
      'ConfirmModalCtrl',
      function ConfirmModalCtrl(
        $scope,
        $uibModalInstance,
        message,
        details,
        canDismiss,
        htmlDetails
      ) {
        $scope.message = message;
        $scope.details = details;
        $scope.canDismiss = canDismiss;

        if (htmlDetails) {
          $scope.htmlDetails = htmlDetails;
          $scope.details = null;
        }

        $scope.agree = function () {
          $uibModalInstance.close(true);
        };

        $scope.disagree = function () {
          $uibModalInstance.dismiss(false);
        };
      }
    );
})();
