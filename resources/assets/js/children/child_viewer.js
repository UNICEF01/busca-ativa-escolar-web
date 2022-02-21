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

	function ChildViewCtrl($scope, $state, $stateParams, Children, Decorators, StaticData, Modals, Groups, ngToast, Cases) {
		if ($state.current.name === "child_viewer") $state.go('.consolidated');

		$scope.Decorators = Decorators;
		$scope.Children = Children;
		$scope.StaticData = StaticData;

		$scope.groups = [];
		$scope.getGroupsToMove = function() {
			var groupsToMove = [];
			$scope.groups.forEach(function(v, k){
				groupsToMove.push({id: v.id, name: v.name});
				v.children.forEach(function(v2, k2){
					groupsToMove.push({id: v2.id, name: v2.name, margin: 10});
					v2.children.forEach(function(v3, k3){
						groupsToMove.push({id: v3.id, name: v3.name, margin: 20});
						v3.children.forEach(function(v4, k4){
							groupsToMove.push({id: v4.id, name: v4.name, margin: 30});
						});
					});
				});
			});
			return groupsToMove;
		};

		$scope.refreshChildData = function(callback) {
			return $scope.child = Children.find({id: $scope.child_id, with: 'currentCase'}, callback);
		};

		$scope.child_id = $stateParams.child_id;
		$scope.child = $scope.refreshChildData();

		$scope.assignGroup = function (){

			var promiseGroup = Groups.findGroupedGroups().$promise
			promiseGroup.then(function(res) {

				$scope.groups = res.data;
				Modals.show(
					Modals.GroupPicker(
						'Atribuir grupo',
						'Indique grupo ...:',
						$scope.getGroupsToMove(),
						true)
				).then(function (selectedGroup) {
					var currentCase = {
						id: $scope.child.currentCase.id,
						group_id: selectedGroup.id
					};
					return Cases.update(currentCase)
				}).then(function (res) {
					ngToast.success('Grupo atribuído com sucesso!')
					$scope.refreshChildData(function (){});
				});

			}, function (err) {
				ngToast.danger('Ocorreu um erro ao retornar grupos!')
			});
		};

		$scope.scopeOfCase = function () {
			if ($scope.child.currentCase.currentStep.assigned_user) {
				if ($scope.child.currentCase.currentStep.assigned_user.type === "coordenador_estadual"
					|| $scope.child.currentCase.currentStep.assigned_user.type === "supervisor_estadual") {
					return "state";
				} else {
					return "municipality";
				}
			}
		};

	}

})();