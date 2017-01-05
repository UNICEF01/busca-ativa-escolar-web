(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('ConfirmSelectModalCtrl', function ConfirmSelectModalCtrl($scope, $q, $uibModalInstance, message, details, list, canDismiss) {

			// console.log("[modal] confirm_modal", message, details, list, canDismiss);

			$scope.message = message;
			$scope.details = details;
			$scope.list = list;
			$scope.canDismiss = canDismiss;

			$scope.agree = function() {
				$uibModalInstance.close(true);
			};

			$scope.disagree = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();