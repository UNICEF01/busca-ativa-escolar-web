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

		$scope.groups = [];
		$scope.getGroupsToMove = function() {
			var groupsToMove = [];
			$scope.groups.forEach(function(v, k){
				groupsToMove.push({id: v.id, name: v.name, children: v.children, is_primary: v.is_primary });
				v.children.forEach(function(v2, k2){
					groupsToMove.push({id: v2.id, name: v2.name, margin: 10, children: v2.children, is_primary: v2.is_primary});
					v2.children.forEach(function(v3, k3){
						groupsToMove.push({id: v3.id, name: v3.name, margin: 20, children: v3.children, is_primary: v3.is_primary});
						v3.children.forEach(function(v4, k4){
							groupsToMove.push({id: v4.id, name: v4.name, margin: 30, children: v4.children, is_primary: v4.is_primary});
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

					var detachUser = false;
					if($scope.child.currentCase.currentStep.hasOwnProperty('assigned_user')){
						if ( $scope.groupBelongsToAnotherGroup($scope.child.currentCase.currentStep.assigned_user.group, selectedGroup) ){
							detachUser = false;
						} else {
							detachUser = true;
						}
					}

					var currentCase = {
						id: $scope.child.currentCase.id,
						group_id: selectedGroup.id,
						detach_user: detachUser
					};

					return Cases.update(currentCase)

				}).then(function (res) {
					ngToast.success('Grupo atribuído com sucesso!')
					$state.go('child_browser');
				});

			}, function (err) {
				ngToast.danger('Ocorreu um erro ao retornar grupos!')
			});
		};

		//verifica se determinado grupo pertence a hierarquia de outro (grupo do caso, grupo selecionado)
		$scope.groupBelongsToAnotherGroup = function (groupOne, groupTwo){
			if (groupTwo.is_primary){ return true; }
			if (groupTwo.id == groupOne.id){ return true; }
			var belongsTo = false;
			groupTwo.children.forEach(function (group){
				if (group.id == groupOne.id) { belongsTo = true; }
				group.children.forEach(function (group2){
					if (group2.id == groupOne.id) { belongsTo = true; }
					group2.children.forEach(function (group3){
						if (group3.id == groupOne.id) { belongsTo = true; }
					});
				});
			});
			return belongsTo;
		};

	}

})();