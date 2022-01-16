(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageGroupsCtrl', function ($scope, $rootScope, $q, ngToast, Platform, Identity, Groups, StaticData) {

			$scope.groups = [];
			$scope.newPrincipalGroupName = '';
			$scope.newSubgroupGroupNames = [];

			$scope.getGroups = function() {
				if(!$scope.groups) return [];
				return $scope.groups;
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

			$scope.removeGroup = function (group){
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