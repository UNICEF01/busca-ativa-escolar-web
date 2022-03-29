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

	function ChildViewCtrl($scope, $state, $stateParams, Children, Decorators, StaticData, Modals, Groups, ngToast, Cases, Identity) {
		if ($state.current.name === "child_viewer") $state.go('.consolidated');

		$scope.Decorators = Decorators;
		$scope.Children = Children;
		$scope.StaticData = StaticData;
		$scope.identity = Identity;

		$scope.refreshChildData = function(callback) {
			return $scope.child = Children.find({id: $scope.child_id, with: 'currentCase'}, callback);
		};

		$scope.child_id = $stateParams.child_id;
		$scope.child = $scope.refreshChildData();

		$scope.assignGroup = function (){

			Modals.show(
				Modals.GroupPicker(
					'Atribuir grupo',
					'Indique grupo ...:',
					true)
			).then(function (selectedGroup) {

			}).then(function (res) {

			});

		};

		$scope.canAssignGroup = function (){
			if(!$scope.isCaseOfTenantOfUserLogged()){ return false; }
			return true;
		};

		$scope.isCaseOfTenantOfUserLogged = function (){
			if ($scope.identity.getCurrentUser().tenant_id){
				if($scope.identity.getCurrentUser().tenant_id == $scope.child.tenant_id){
					return true;
				}else{
					return false;
				}
			}
			return false;
		};

	}

})();