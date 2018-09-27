(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function($stateProvider) {
			$stateProvider.state('tenant_browser', {
				url: '/tenants',
				templateUrl: '/views/tenants/list.html',
				controller: 'TenantBrowserCtrl'
			})
		})
		.controller('TenantBrowserCtrl', function ($scope, $rootScope, ngToast, $state, Tenants, Modals, Identity, Config, Ufs) {

			$scope.identity = Identity;
			$scope.tenants = {};
			$scope.ufs = Ufs;
			$scope.query = {
				filter: {},
				sort: {},
				max: 16,
				page: 1
			};

			$scope.refresh = function() {
				$scope.tenants = Tenants.all($scope.query);
			};

			$scope.export = function() {
				Identity.provideToken().then(function (token) {
					window.open(Config.getAPIEndpoint() + 'tenants/export?token=' + token);
				});
			};

			$scope.disableTenant = function(tenant) {

				Modals.show(
					Modals.Confirm(
						'Tem certeza que deseja cancelar o município: ' + tenant.name,
						'Ao confirmar, os acessos do município serão cancelados, e todos os dados recebidos serão arquivados, e não poderão mais ser acessados. ' +
						'Os alertas e lembretes não serão disparados. As estatísticas e métricas coletadas não serão apagadas'
					))
					.then(function () {
						return Tenants.cancel({id: tenant.id}).$promise;
					})
					.then(function (res) {
						if(res && res.status === 'ok') {
							ngToast.success('Município cancelado com sucesso!');
							$scope.refresh();
							return;
						}

						ngToast.danger('Ocorreu um erro ao cancelar o município!');
						console.error("[tenants.cancel] Failed to cancel tenant: ", res);
					})

			};
			
			$scope.refresh();

		});

})();