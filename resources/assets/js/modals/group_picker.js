(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('GroupPickerModalCtrl', function GroupPickerModalCtrl($scope, $q, ngToast, $uibModalInstance, title, message, canDismiss, noGroupsMessage) {

			$scope.title = title;
			$scope.message = message;
			$scope.canDismiss = canDismiss;
			$scope.noGroupsMessage = noGroupsMessage;

			$scope.selectedGroup = null;

			$scope.onSelect = function() {
				if(!$scope.selectedGroup) {
					ngToast.danger('Você não selecionou nenhum grupo!');
					return;
				}
				$uibModalInstance.close({response: $scope.selectedGroup});
			};

			$scope.close = function() {
				$uibModalInstance.dismiss(false);
			}

		});

})();