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
					groupsToMove.push({id: v2.id, name: v2.name, margin: 20, children: v2.children, is_primary: v2.is_primary});
					v2.children.forEach(function(v3, k3){
						groupsToMove.push({id: v3.id, name: v3.name, margin: 40, children: v3.children, is_primary: v3.is_primary});
						v3.children.forEach(function(v4, k4){
							groupsToMove.push({id: v4.id, name: v4.name, margin: 60, children: v4.children, is_primary: v4.is_primary});
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
						//se tem usuário assinado para o caso

						Groups.findById({id: $scope.child.currentCase.currentStep.assigned_user.group.id}).$promise
							.then(function (group){

								if ( $scope.needsToRemoveUser(group.data[0], selectedGroup) ){
									detachUser = true;
								} else {
									detachUser = false;
								}

								var currentCase = {
									id: $scope.child.currentCase.id,
									group_id: selectedGroup.id,
									detach_user: detachUser
								};

								Cases.update(currentCase).$promise
									.then(function (res){
										ngToast.success('Grupo atribuído com sucesso!')
										$state.go('child_browser');
									});

							});

					} else {
						//se não tem usuário assinado para o caso

						var currentCase = {
							id: $scope.child.currentCase.id,
							group_id: selectedGroup.id,
							detach_user: detachUser
						};

						Cases.update(currentCase).$promise
							.then(function (res){
								ngToast.success('Grupo atribuído com sucesso!')
								$state.go('child_browser');
							});
					}

				}).then(function (res) {

				});

			}, function (err) {
				ngToast.danger('Ocorreu um erro ao retornar grupos!')
			});
		};
		
		//verifica se deve remover usuário do caso
		$scope.needsToRemoveUser = function (groupOfuser, groupOfMunicipality){
			if (groupOfMunicipality.id == groupOfuser.id){ return false; }
			if (groupOfMunicipality.is_primary){ return true; }
			var needsToRemove = true;
			groupOfuser.children.forEach(function (group){
				if (group.id == groupOfMunicipality.id) { needsToRemove = false; }
				group.children.forEach(function (group2){
					if (group2.id == groupOfMunicipality.id) { needsToRemove = false; }
					group2.children.forEach(function (group3){
						if (group3.id == groupOfMunicipality.id) { needsToRemove = false; }
					});
				});
			});
			return needsToRemove;
		};

	}

})();