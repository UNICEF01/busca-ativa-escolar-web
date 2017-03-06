(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('user_browser', {
				url: '/users',
				templateUrl: '/views/users/browser.html',
				controller: 'UserBrowserCtrl'
			})
		})
		.controller('UserBrowserCtrl', function ($scope, $rootScope, ngToast, Platform, Identity, Users, Groups, Tenants, StaticData) {

		$scope.identity = Identity;
		$scope.query = {
			tenant_id: null,
			group_id: null,
			type: null,
			email: null,
			max: 128,
			with: 'tenant',
			show_suspended: true
		};

		$scope.quickAdd = false;

		$scope.enableQuickAdd = function() {
			$scope.quickAdd = true;
		};

		$scope.setMaxResults = function(max) {
			$scope.query.max = max;
			$scope.refresh();
		};

		$scope.static = StaticData;
		$scope.tenants = Tenants.find();
		$scope.groups = Groups.find();
		$scope.canFilterByTenant = false;

		$scope.checkboxes = {};
		$scope.search = {};

		$scope.getGroups = function() {
			if(!$scope.groups || !$scope.groups.data) return [];
			return $scope.groups.data;
		};

		$scope.getTenants = function() {
			if(!$scope.tenants || !$scope.tenants.data) return [];
			return $scope.tenants.data;
		};

		$scope.refresh = function() {
			$scope.search = Users.search($scope.query);
		};

		$scope.suspendUser = function(user) {
			Users.suspend({id: user.id}, function (res) {
				ngToast.success('Usuário desativado!');
				$scope.refresh();
			});
		};

		$scope.restoreUser = function(user) {
			Users.restore({id: user.id}, function (res) {
				ngToast.success('Usuário reativado!');
				$scope.refresh();
			});
		};

		$scope.refresh();

		Platform.whenReady(function() {
			$scope.canFilterByTenant = (Identity.getType() === 'gestor_nacional' || Identity.getType() === 'superuser');
			console.log("[user_browser] Can filter by tenant? ", Identity.getType(), $scope.canFilterByTenant);
		})

	});

})();