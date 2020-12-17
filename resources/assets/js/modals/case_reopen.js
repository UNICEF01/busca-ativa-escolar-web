(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('CaseReopenModalCtrl', function CaseRestartModalCtrl($scope, $q, $uibModalInstance, $typeUser) {

			//console.log("[modal] case_restart");

			$scope.step = 1;
			$scope.reason = "";
			$scope.typeUser = $typeUser;

			$scope.ok = function() {
				if(!$scope.reason) return;
				$uibModalInstance.close({response: $scope.reason});
			};

			$scope.cancel = function() {
				$uibModalInstance.dismiss(false);
			};

		});

})();