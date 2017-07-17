(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('pending_signups', {
				url: '/pending_signups',
				templateUrl: '/views/tenants/pending_signups.html',
				controller: 'PendingSignupsCtrl'
			})
		})
		.controller('PendingSignupsCtrl', function ($scope, $rootScope, ngToast, Identity, SignUps, StaticData) {

			$scope.identity = Identity;
			$scope.static = StaticData;

			$scope.signups = {};
			$scope.signup = {};
			$scope.query = {sort: {created_at: 'desc'}, filter: {status: 'pending'}};

			$scope.refresh = function() {
				$scope.signups = SignUps.getPending($scope.query);
				return $scope.signups.$promise;
			};

			$scope.preview = function(signup) {
				$scope.signup = signup;
			};

			$scope.approve = function(signup) {
				SignUps.approve({id: signup.id}, function() {
					$scope.refresh();
					$scope.signup = {};
				});
			};

			$scope.reject = function(signup) {
				SignUps.reject({id: signup.id}, function() {
					$scope.refresh();
					$scope.signup = {};
				});
			};

			$scope.updateRegistrationEmail = function(type, signup) {
				SignUps.updateRegistrationEmail({id: signup.id, type: type, email: signup.data[type].email}, function (res) {
					if(res.status !== "ok") {
						ngToast.danger("Falha ao atualizar o e-mail do gestor: " + res.reason);
						return;
					}

					ngToast.success("E-mail do gestor atualizado!");
				});
			};

			$scope.resendNotification = function(signup) {
				SignUps.resendNotification({id: signup.id}, function() {
					ngToast.success('Notificação reenviada!');
				});
			};

			$scope.refresh();

		});

})();