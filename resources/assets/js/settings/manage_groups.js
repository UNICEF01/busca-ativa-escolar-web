(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageGroupsCtrl', function ($scope, $rootScope, $q, ngToast, Platform, Identity, Groups, StaticData, Modals) {

			$scope.groups = [];
			$scope.newPrincipalGroupName = '';
			$scope.newSubgroupGroupNames = [];

			$scope.getGroups = function() {
				if(!$scope.groups) return [];
				return $scope.groups;
			};

			$scope.getGroupsToMove = function(groupFromMove) {
				if(!$scope.groups) return [];
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

			$scope.addPrincipalGroup = function (){

				if(!$scope.newPrincipalGroupName) return;
				if($scope.newPrincipalGroupName.length < 3) return;

				var group = {
					name: $scope.newPrincipalGroupName,
					is_primary: false,
					is_creating: true
				};

				$scope.newPrincipalGroupName = '';

				var promiseGroup = Groups.create(
					{name: group.name}
				).$promise

				promiseGroup.then(function(res) {
					ngToast.success('Grupos alterados com sucesso!')
					$scope.refresh();
				}, function (err) {
					ngToast.danger('Ocorreu um erro ao salvar os grupos!')
					$scope.refresh();
				});
			};

			$scope.addSubGroup = function (newName, parent_id){

				if(!newName) return;
				if(newName.length < 3) return;

				var group = {
					name: newName,
					parent_id: parent_id
				};

				$scope.newSubgroupGroupNames = [];

				var promiseGroup = Groups.create(group).$promise

				promiseGroup.then(function(res) {
					ngToast.success('Grupo criado com sucesso!')
					$scope.refresh();
				}, function (err) {
					ngToast.danger('Ocorreu um erro ao salvar o grupo!')
					$scope.refresh();
				});

			};

			$scope.updateGroup = function (newName, id){

				if(!newName) return;
				if(newName.length < 3) return;

				var group = {
					name: newName,
					id: id
				};

				var promiseGroup = Groups.update(group).$promise

				promiseGroup.then(function(res) {
					ngToast.success('Grupo editado com sucesso!')
					$scope.refresh();
				}, function (err) {
					ngToast.danger('Ocorreu um erro ao editar o grupo!')
					$scope.refresh();
				});

			};

			$scope.removeGroup = function (groupToRemove){

				Modals.show(
					Modals.GroupPicker(
						'Remover grupo '+ groupToRemove.name,
						'Existem X casos, X alertas e X usuários que pertencem a esse grupo ...',
						$scope.getGroupsToMove(groupToRemove),
						true)
				).then(function (selectedGroup) {
					var obj = {
						id: groupToRemove.id,
						replace: selectedGroup.id
					}
					var promissGroup = Groups.replaceAndDelete(obj).$promise

					promissGroup.then(
						function (res){
							ngToast.success('Grupo removido com sucesso!')
							$scope.refresh();
						},
						function (err){
							ngToast.danger('Grupo não pôde ser removido!')
							$scope.refresh();
						}
					)

				}).then(function (res) {
					console.log(res);
				});

			};

			$scope.moveGroup = function (groupFromMove){
				Modals.show(
					Modals.GroupPicker(
						'Movimentar '+ groupFromMove.name,
						'Indique grupo pai para onde deseja movimentar:',
						$scope.getGroupsToMove(groupFromMove),
						true)
				).then(function (parentGroup) {

					var group = {
						parent_id: parentGroup.id,
						id: groupFromMove.id
					};

					var promiseGroup = Groups.update(group).$promise

					promiseGroup.then(
						function (res){
							ngToast.success('Grupo movimentado com sucesso!')
							$scope.refresh();
						},
						function (err){
							ngToast.danger('Grupo não pôde ser movimentado!')
							$scope.refresh();
						}
					);

				}).then(function (res) {

				});
			};

			$scope.refresh = function() {
				Groups.findGroupedGroups(function(res) {
					$scope.groups = res.data;
					$scope.groupsCopy = angular.copy($scope.groups);
				});
			};

			Platform.whenReady(function() {
				$scope.refresh();
			});

			$scope.isGroupPartOfUserGroups = function (group){
				var groupedGroupsOfUser = $scope.getGroupsOfLoggedUser();
				var belongsTo = false;

				groupedGroupsOfUser.forEach(function(v, k){
					if(v.id == group.id) { belongsTo = true; }
					v.children.forEach(function(v2, k2){
						if(v2.id == group.id) { belongsTo = true; }
						v2.children.forEach(function(v3, k3){
							if(v3.id == group.id) { belongsTo = true; }
							v3.children.forEach(function(v4, k4){
								if(v4.id == group.id) { belongsTo = true; }
							});
						});
					});
				});

				return belongsTo;
			};

			$scope.getGroupsOfLoggedUser = function (){
				var groupedGroupsOfUser = [];
				var userId = Identity.getCurrentUser().group.id;
				$scope.groups.forEach(function(v, k){
					if (v.id == userId) { groupedGroupsOfUser = [v]; }
					v.children.forEach(function(v2, k2){
						if (v2.id == userId) { groupedGroupsOfUser = [v2]; }
						v2.children.forEach(function(v3, k3){
							if (v3.id == userId) { groupedGroupsOfUser = [v3]; }
							v3.children.forEach(function(v4, k4){
								if (v4.id == userId) { groupedGroupsOfUser = [v4]; }
							});
						});
					});
				});
				return groupedGroupsOfUser;
			}

		});
})();