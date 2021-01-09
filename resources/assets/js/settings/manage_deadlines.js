(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageDeadlinesCtrl', function ($scope, $rootScope, $q, ngToast, Platform, Identity, Tenants, Groups, StaticData) {

			$scope.static = StaticData;
			$scope.tenantSettings = {};

			$scope.save = function() {

				Tenants.updateSettings($scope.tenantSettings).$promise.then(
					function (res) {
						//console.log('[manage_deadlines.save] Saved! ', res);
						ngToast.success('Configurações salvas com sucesso!');
						$scope.refresh();
					},
					function (err) {
						//console.error('[manage_deadlines.save] Error: ', err);
						ngToast.danger('Ocorreu um erro ao atualizar as configurações');
					}
				);

			};

			$scope.refresh = function() {
				Tenants.getSettings(function (res) {
					//console.log('[manage_deadlines] Current settings: ', res);
					$scope.tenantSettings = res;
				});
			};

			Platform.whenReady(function() {
				$scope.refresh();
			})

		});

})();