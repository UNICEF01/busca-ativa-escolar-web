(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageGroupsCtrl', function ($scope, $filter, $rootScope, $q, ngToast, Platform, Identity, Groups, StaticData, Modals) {

			$scope.currentUser = Identity.getCurrentUser();

			$scope.groupsTwo = [];
			$scope.groupsThree = [];
			$scope.groupsFour = [];

			$scope.mirrorGroupsTwo = [];
			$scope.mirrorGroupsThree = [];
			$scope.mirrorGroupsFour =  [];

			$scope.selectedTabTwo = null;
			$scope.selectedTabThree = null;
			$scope.selectedTabFour = null;

			$scope.refresh = function() {
				Groups.findByParent( { id: $scope.currentUser.tenant.primary_group_id }, function(res) {
					$scope.groupsTwo = res.data;
					$scope.mirrorGroupsTwo = angular.copy($scope.groupsTwo);

					$scope.groupsThree = [];
					$scope.mirrorGroupsThree = angular.copy($scope.groupsThree);

					$scope.groupsFour = [];
					$scope.mirrorGroupsFour = angular.copy($scope.groupsFour);

					$scope.groupForEditionTwo = { id: null, name: null, parent_id: $scope.currentUser.tenant.primary_group_id };
				});
			};

			$scope.editGroupTwo = function (group){
				$scope.groupForEditionTwo = group;
			};

			$scope.updateGroupTwo = function (){
				if($scope.groupForEditionTwo.name){
					if($scope.groupForEditionTwo.name.length >= 3){
						$scope.updateGroup($scope.groupForEditionTwo);
					}
				}
			};

			$scope.onSelectGroup = function (number, group){

				if (number == 2 ){
					$scope.selectedTabTwo = group.id;
					Groups.findByParent( { id: group.id }, function(res) {
						$scope.groupsThree = res.data;
						$scope.mirrorGroupsThree = angular.copy($scope.groupsThree);
						$scope.groupsFour = [];
						$scope.mirrorGroupsFour = angular.copy($scope.groupsFour);
					});
				}

				if (number == 3 ){
					$scope.selectedTabThree = group.id;
					Groups.findByParent( { id: group.id }, function(res) {
						$scope.groupsFour = res.data;
						$scope.mirrorGroupsFour = angular.copy($scope.groupsFour);
					});
				}

				if (number == 4 ){
					$scope.selectedTabFour = group.id;
				}

			};

			$scope.filterGroups = function(group) {
				if(group === "two"){
					$scope.mirrorGroupsTwo = $filter("filter")($scope.groupsTwo, {
						$: $scope.searchGroupTwo
					});
				}
				if(group === "three"){
					$scope.mirrorGroupsThree = $filter("filter")($scope.groupsThree, {
						$: $scope.searchGroupThree
					});
				}
				if(group === "four"){
					$scope.mirrorGroupsFour = $filter("filter")($scope.groupsFour, {
						$: $scope.searchGroupFour
					});
				}
			};

			$scope.updateGroup = function (group){

				if(group.id == null){
					var promiseGroup = Groups.create(group).$promise
				}else{
					var promiseGroup = Groups.update(group).$promise
				}
				promiseGroup.then(function(res) {
					ngToast.success('Grupos alterados com sucesso!')
					$scope.refresh();
				}, function (err) {
					ngToast.danger('Ocorreu um erro ao salvar os grupos!')
					$scope.refresh();
				});

			};

			$scope.removeGroupTwo = function (group){
				alert(group.name);
			};

			Platform.whenReady(function() {
				$scope.refresh();
			});

		});
})();