(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function($stateProvider) {
			$stateProvider.state('tenant_browser', {
				url: '/tenants',
				templateUrl: '/views/tenants/list.html',
				controller: 'TenantBrowserCtrl'
			})
		})
		.controller('TenantBrowserCtrl', function ($scope, $rootScope, Tenants, Identity) {

			$scope.identity = Identity;
			$scope.tenants = {};
			$scope.query = {sort: {}};

			$scope.refresh = function() {
				$scope.tenants = Tenants.all($scope.query);
			};
			
			$scope.refresh();

		});

})();