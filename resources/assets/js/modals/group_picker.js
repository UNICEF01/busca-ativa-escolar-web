(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('GroupPickerModalCtrl', function GroupPickerModalCtrl($scope, $q, ngToast, $uibModalInstance, title, message, groups, canDismiss, noGroupsMessage) {

			$scope.title = title;
			$scope.message = message;
			$scope.canDismiss = canDismiss;
			$scope.noGroupsMessage = noGroupsMessage;

			$scope.selectedGroup = null;
			$scope.groups = groups;

			$scope.hasGroups = function() {
				if(!$scope.groups) return false;
				return ($scope.groups.length > 0);
			};

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