(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('tenant_setup', {
				url: '/tenant_setup?step',
				templateUrl: '/views/initial_tenant_setup/main.html',
				controller: 'TenantSetupCtrl'
			});
		})
		.controller('TenantSetupCtrl', function ($scope, $state, $stateParams, Platform, Identity, TenantSignups, Tenants, Modals) {

			if(!$stateParams.step) return $state.go('tenant_setup', {step: 1});

			$scope.step = parseInt($stateParams.step, 10);
			$scope.isReady = false;
			$scope.tenant = {};

			$scope.getAdminUserID = function() {
				return $scope.tenant.operational_admin_id;
			};

			$scope.goToStep = function(step) {
				if(step > 5) return;
				if(step < 1) return;
				$state.go('tenant_setup', {step: step});
			};

			$scope.nextStep = function() {

				var step = $scope.step + 1;
				if($scope.step > 5) {
					return $scope.completeSetup();
				}

				$state.go('tenant_setup', {step: step});
			};

			$scope.prevStep = function() {
				var step = $scope.step - 1;
				if(step <= 0) step = 1;

				$state.go('tenant_setup', {step: step});
			};

			$scope.getCurrentStep = function() {
				return $scope.step;
			};

			$scope.completeSetup = function() {
				Modals.show(Modals.Confirm(
				'Deseja prosseguir com o cadastro?',
				'Os dados informados poderão ser alterados por você e pelos gestores na área de Configurações.'
				)).then(function(res) {
					TenantSignups.completeSetup({}, function() {
						Platform.setFlag('HIDE_NAVBAR', false);

						Identity.refresh();

						$state.go('dashboard');
					});
				});
			};

			Platform.whenReady(function() {
				Platform.setFlag('HIDE_NAVBAR', true);

				$scope.tenant = Identity.getCurrentUser().tenant;
				$scope.isReady = true;

				console.info('[tenant_setup] Tenant setup for: ', $scope.tenant);
			});

		});

})();