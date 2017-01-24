(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ChildViewCtrl', ChildViewCtrl)

		.config(function ($stateProvider) {
			$stateProvider
				.state('child_viewer', {
					url: '/children/view/{child_id}',
					templateUrl: '/views/children/view/viewer.html',
					controller: 'ChildViewCtrl'
				})
				.state('child_viewer.activity_log', {
					url: '/activity_log',
					templateUrl: '/views/children/view/activity_log.html'
				})
		});

	function ChildViewCtrl($scope, $state, $stateParams, Children, Decorators) {
		if ($state.current.name === "child_viewer") $state.go('.cases');

		$scope.Decorators = Decorators;
		$scope.Children = Children;

		$scope.child_id = $stateParams.child_id;
		$scope.child = Children.find({id: $scope.child_id});

		console.log("[core] @ChildViewCtrl", $scope.child);

	}

})();