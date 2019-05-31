(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ChildActivityLogCtrl', ChildActivityLogCtrl)

		.config(function ($stateProvider) {
			$stateProvider
				.state('child_viewer.activity_log', {
					url: '/activity_log',
					templateUrl: '/views/children/view/activity_log.html',
					controller: 'ChildActivityLogCtrl'
				})
		});

	function ChildActivityLogCtrl($scope, $state, $stateParams, Children, Decorators) {

		$scope.Decorators = Decorators;
		$scope.Children = Children;

		$scope.entries = {};

		$scope.refresh = function() {
			$scope.entries = Children.getActivity({id: $stateParams.child_id});
		};

		$scope.refresh();

		console.log("[core] @ChildActivityLogCtrl", $scope.$parent.entries);

	}

})();