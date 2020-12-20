(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('pending_state_signups', {
				url: '/pending_state_signups',
				templateUrl: '/views/states/pending_signups.html',
				controller: 'PendingStateSignupsCtrl'
			})
		})
		.controller('PendingStateSignupsCtrl', function ($scope, $rootScope, ngToast, Identity, StateSignups, StaticData) {

			$scope.identity = Identity;
			$scope.static = StaticData;

			$scope.signups = {};
			$scope.signup = {};
			$scope.query = {
				sort: {created_at: 'desc'},
				filter: {status: 'pending'},
				max: 16,
				page: 1
			};

			$scope.refresh = function() {
				$scope.signups = StateSignups.getPending($scope.query);
				return $scope.signups.$promise;
			};

			$scope.preview = function(signup) {
				$scope.signup = signup;
			};

			$scope.approve = function(signup) {
				StateSignups.approve({id: signup.id}, function() {
					$scope.refresh();
					$scope.signup = {};
				});
			};

			$scope.reject = function(signup) {
				StateSignups.reject({id: signup.id}, function() {
					$scope.refresh();
					$scope.signup = {};
				});
			};

			$scope.updateRegistrationEmail = function(type, signup) {
				StateSignups.updateRegistrationEmail({id: signup.id, type: type, email: signup.data[type].email}, function (res) {
					if(res.status !== "ok") {
						ngToast.danger("Falha ao atualizar o e-mail do gestor: " + res.reason);
						return;
					}

					ngToast.success("E-mail do(a) gestor(a) atualizado!");
				});
			};

			$scope.resendNotification = function(signup) {
				StateSignups.resendNotification({id: signup.id}, function() {
					ngToast.success('Notificação reenviada!');
				});
			};

			$scope.refresh();

		});

})();