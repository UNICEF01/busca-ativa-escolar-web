(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('pending_tenant_signups', {
				url: '/pending_tenant_signups',
				templateUrl: '/views/tenants/pending_signups.html',
				controller: 'PendingTenantSignupsCtrl'
			})
		})
		.controller('PendingTenantSignupsCtrl', function ($scope, $rootScope, ngToast, Identity, TenantSignups, StaticData, Config) {

			$scope.identity = Identity;
			$scope.static = StaticData;

			$scope.signups = {};
			$scope.signup = {};
			$scope.query = {
				max: 16,
				page: 1,
				sort: {created_at: 'desc'},
				filter: {status: 'pending_approval'}
			};

			$scope.electedMayor = null;

			$scope.copyText = function(){
				$scope.msgCopy = "URL COPIADA";
				setTimeout(function(){ $scope.msgCopy = '';}, 500);
			};

            $scope.onSelectType = function() {
                $scope.query.page = 1;
                $scope.refresh();
            };

            $scope.refresh = function() {
				$scope.signups = TenantSignups.getPending($scope.query);
				return $scope.signups.$promise;
			};

			$scope.export = function() {
				Identity.provideToken().then(function (token) {
					window.open(Config.getAPIEndpoint() + 'signups/tenants/export?token=' + token + $scope.prepareUriToExport());
				});
			};

            $scope.prepareUriToExport = function () {
                var uri = "";
                Object.keys($scope.query.filter).forEach( function (element) {
                    uri = uri.concat("&"+element+"="+$scope.query.filter[element]);
                });
                return uri;
            };

			$scope.preview = function(signup) {
				$scope.signup = signup;
				$scope.getMayorByCPF(signup.data.mayor.cpf);
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

			$scope.getMayorByCPF = function (numberCPF) {
				TenantSignups.getMayorByCPF({cpf: numberCPF}, function(res) {
					$scope.electedMayor = res;
				});
			};

		});

})();
