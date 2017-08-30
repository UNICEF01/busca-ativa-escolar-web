(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('pending_tenant_signups', {
				url: '/pending_tenant_signups',
				templateUrl: '/views/tenants/pending_signups.html',
				controller: 'PendingTenantSignupsCtrl'
			})
		})
		.controller('PendingTenantSignupsCtrl', function ($scope, $rootScope, ngToast, Identity, TenantSignups, StaticData) {

			$scope.identity = Identity;
			$scope.static = StaticData;

			$scope.signups = {};
			$scope.signup = {};
			$scope.query = {
				max: 16,
				page: 1,
				sort: {created_at: 'desc'},
				filter: {status: 'pending'}
			};

			$scope.refresh = function() {
				$scope.signups = TenantSignups.getPending($scope.query);
				return $scope.signups.$promise;
			};

			$scope.preview = function(signup) {
				$scope.signup = signup;
			};

			$scope.approve = function(signup) {
				TenantSignups.approve({id: signup.id}, function() {
					$scope.refresh();
					$scope.signup = {};
				});
			};

			$scope.reject = function(signup) {
				TenantSignups.reject({id: signup.id}, function() {
					$scope.refresh();
					$scope.signup = {};
				});
			};

			$scope.updateRegistrationEmail = function(type, signup) {
				TenantSignups.updateRegistrationEmail({id: signup.id, type: type, email: signup.data[type].email}, function (res) {
					if(res.status !== "ok") {
						ngToast.danger("Falha ao atualizar o e-mail do gestor: " + res.reason);
						return;
					}

					ngToast.success("E-mail do gestor atualizado!");
				});
			};

			$scope.resendNotification = function(signup) {
				TenantSignups.resendNotification({id: signup.id}, function() {
					ngToast.success('Notificação reenviada!');
				});
			};

			$scope.refresh();

		});

})();