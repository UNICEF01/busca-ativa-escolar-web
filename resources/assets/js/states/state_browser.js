(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function($stateProvider) {
			$stateProvider.state('state_browser', {
				url: '/states',
				templateUrl: '/views/states/list.html',
				controller: 'StateBrowserCtrl'
			})
		})
		.controller('StateBrowserCtrl', function ($scope, $rootScope, ngToast, $state, StaticData, States, Modals, Identity) {

			$scope.identity = Identity;
			$scope.static = StaticData;
			$scope.states = {};
			$scope.query = {
				filter: {},
				sort: {},
				max: 16,
				page: 1
			};

			$scope.refresh = function() {
				$scope.states = States.all($scope.query);
			};
			
			$scope.refresh();

		});

})();