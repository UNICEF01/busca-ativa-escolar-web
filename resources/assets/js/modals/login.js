(function() {

	angular
		.module('BuscaAtivaEscolar')
		.controller('LoginModalCtrl', function LoginModalCtrl($scope, $uibModalInstance, Modals, Identity, Auth, reason, canDismiss) {

			console.log("[modal] login", reason, canDismiss);

			$scope.email = '';
			$scope.password = '';

			$scope.reason = reason;
			$scope.canDismiss = canDismiss;

			function onLoggedIn(session) {
				$uibModalInstance.close({response: Identity.getCurrentUser()});
			}

			function onError() {
				Modals.show(Modals.Alert('Usuário ou senha incorretos', 'Por favor, verifique os dados informados e tente novamente.'));
			}

			$scope.login = function() {
				Auth.login($scope.email, $scope.password).then(onLoggedIn, onError);
			};

			$scope.close = function() {
				$uibModalInstance.dismiss(false);
			}

		});

})();