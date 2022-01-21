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
					if (groupFromMove.id == v.id) return;
					groupsToMove.push({id: v.id, name: v.name});
					v.children.forEach(function(v2, k2){
						if (groupFromMove.id == v2.id) return;
						groupsToMove.push({id: v2.id, name: v2.name, margin: 10});
						v2.children.forEach(function(v3, k3){
							if (groupFromMove.id == v3.id) return;
							groupsToMove.push({id: v3.id, name: v3.name, margin: 20});
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
			}

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

			}

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

			}

			$scope.removeGroup = function (group){

				Modals.show(

					Modals.Confirm(
						'Confirma a remoção do grupo '+group.name+' ?',
						'A remoção do grupo pode levar mais tempo considerando a quantidade de usuários e casos que serão alterados....'
					)).then(function () {

					if(group.is_primary) return;

					var promiseGroup = Groups.delete(
						{id: group.id}
					).$promise

					$scope.newSubgroupGroupNames = [];
					$scope.newPrincipalGroupName = '';

					promiseGroup.then(function(res) {
						ngToast.success('Grupo removido com sucesso!')
						$scope.refresh();
					}, function (err) {
						ngToast.danger('Ocorreu um erro ao remover o grupo!')
						$scope.refresh();
					});

				});

			}

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
					return Groups.update(group)
				}).then(function (res) {
					ngToast.success('Grupo movimentado com sucesso!')
					$scope.refresh();
				});
			}

			$scope.refresh = function() {
				Groups.findGroupedGroups(function(res) {
					$scope.groups = res.data;
					$scope.groupsCopy = angular.copy($scope.groups);
				});
			};

			Platform.whenReady(function() {
				$scope.refresh();
			});

		});

})();