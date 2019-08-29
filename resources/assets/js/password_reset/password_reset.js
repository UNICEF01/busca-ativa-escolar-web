(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider
				.state('forgot_password', {
					url: '/forgot_password',
					templateUrl: '/views/password_reset/begin_password_reset.html',
					controller: 'ForgotPasswordCtrl',
					unauthenticated: true
				})
				.state('password_reset', {
					url: '/password_reset?email&token',
					templateUrl: '/views/password_reset/complete_password_reset.html',
					controller: 'PasswordResetCtrl',
					unauthenticated: true
				})
		})
		.controller('ForgotPasswordCtrl', function ($scope, $state, $stateParams, ngToast, PasswordReset) {

			$scope.email = "";
			$scope.isLoading = false;

			console.info("[password_reset.forgot_password] Begin password reset");

			$scope.requestReset = function() {
				$scope.isLoading = true;

				PasswordReset.begin({email: $scope.email}, function (res) {
					$scope.isLoading = false;

					if(res.status !== 'ok') {
						ngToast.danger("Erro! " + res.reason);
						return;
					}

					ngToast.success("Solicitação de troca realizada com sucesso! Verifique em seu e-mail o link para troca de senha.");
					$state.go('login');
				})
			}

		})
		.controller('PasswordResetCtrl', function ($scope, $state, $stateParams, ngToast, PasswordReset) {

			var resetEmail = $stateParams.email;
			var resetToken = $stateParams.token;

			console.info("[password_reset.password_reset] Complete password reset for ", resetEmail, ", token=", resetToken);

			$scope.email = resetEmail;
			$scope.newPassword = "";
			$scope.newPasswordConfirm = "";
			$scope.isLoading = false;

			$scope.resetPassword = function() {

				if($scope.newPassword !== $scope.newPasswordConfirm) {
					ngToast.danger("A senha e a confirmação de senha devem ser iguais!");
					return;
				}

				$scope.isLoading = true;

				PasswordReset.complete({email: resetEmail, token: resetToken, new_password: $scope.newPassword}, function (res) {
					$scope.isLoading = false;

					if(res.status !== 'ok') {
						ngToast.danger("Ocorreu um erro ao trocar a senha: " + res.reason);
						return;
					}

					ngToast.success("Sua senha foi trocada com sucesso! Você pode efetuar o login com a nova senha agora.");
					$state.go('login');
				});
			}

		});

})();