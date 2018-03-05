(function() {

	angular.module('BuscaAtivaEscolar').controller('DashboardCtrl', function ($scope, moment, Platform, Identity, StaticData, Tenants, Reports, Charts) {

		$scope.identity = Identity;
		$scope.static = StaticData;
		$scope.tenantInfo = Tenants.getSettings();

		$scope.ready = false;

		Platform.whenReady(function() {
			$scope.ready = true;
		})


	});

})();