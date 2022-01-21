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
		});

	function ChildViewCtrl($scope, $state, $stateParams, Children, Decorators, StaticData) {
		if ($state.current.name === "child_viewer") $state.go('.consolidated');

		$scope.Decorators = Decorators;
		$scope.Children = Children;
		$scope.StaticData = StaticData;

		$scope.refreshChildData = function(callback) {
			return $scope.child = Children.find({id: $scope.child_id, with: 'currentCase'}, callback);
		};

		$scope.child_id = $stateParams.child_id;
		$scope.child = $scope.refreshChildData();

		$scope.assignGroup = function (){
			alert("Modal para selecao de grupos ...");
		}

		//console.log("[core] @ChildViewCtrl", $scope.child);

	}

})();