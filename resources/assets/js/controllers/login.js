(function() {

	angular.module('BuscaAtivaEscolar').controller('LoginCtrl', function ($scope, $rootScope, $cookies, $state, $location, Modals, Config, Auth, Identity) {

		//console.log("[core] @Login");

		$rootScope.section = '';

		$scope.email = '';
		$scope.password = '';
		$scope.isLoading = false;

		$scope.endpoints = {
			allowed: Config.ALLOWED_ENDPOINTS,
			list: Config.API_ENDPOINTS
		};

		if(Identity.isLoggedIn()) {
			$state.go('dashboard');
		}

        $scope.showPassowrd = function () {
            var field_password = document.getElementById("fld-password");
            field_password.type === "password" ? field_password.type = "text" : field_password.type ="password"
        }

		function onLoggedIn(session) {

			$scope.isLoading = false;

			//console.info("[login_ctrl] Logged in!", session);
			//console.info("[login_ctrl] Tenant: ", Identity.getCurrentUser().tenant);

			// Check if user should see tenant first time setup
			if(!Identity.isUserType('coordenador_operacional')) return $state.go('dashboard');
			if(!Identity.hasTenant()) return $state.go('dashboard');
			if(!Identity.getCurrentUser().tenant.is_setup) return $state.go('tenant_setup');

			return $state.go('dashboard');
		}

		function onError(err) {
			console.error('[login_ctrl] Login failed: ', err);
			Modals.show(Modals.Alert('Usuário ou senha incorretos', 'Por favor, verifique os dados informados e tente novamente.'));
			$scope.isLoading = false;
		}

		$scope.setAPIEndpoint = function(endpointID) {
			Config.setEndpoint(endpointID);
			$cookies.put('FDENP_API_ENDPOINT', endpointID);
		};

		$scope.login = function() {
			$scope.isLoading = true;
			Auth.login($scope.email, $scope.password).then(onLoggedIn, onError);
		};

	});

})();