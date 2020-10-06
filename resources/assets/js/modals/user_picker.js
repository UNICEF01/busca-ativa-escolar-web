(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('UserPickerModalCtrl', function UserPickerModalCtrl($scope, $q, ngToast, $uibModalInstance, title, message, users, canDismiss, noUsersMessage) {

			//console.log("[modal] user_picker", title, message);

			$scope.title = title;
			$scope.message = message;
			$scope.canDismiss = canDismiss;
			$scope.noUsersMessage = noUsersMessage;

			$scope.selectedUser = null;
			$scope.users = users;

			$scope.hasUsers = function() {
				if(!$scope.users) return false;
				return ($scope.users.length > 0);
			};

			$scope.onSelect = function() {
				if(!$scope.selectedUser) {
					ngToast.danger('Você não selecionou nenhum usuário!');
					return;
				}

				$uibModalInstance.close({response: $scope.selectedUser});
			};

			$scope.close = function() {
				$uibModalInstance.dismiss(false);
			}

		});

})();