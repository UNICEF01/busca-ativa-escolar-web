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

			$scope.searchGroupTwo = '';
			$scope.searchGroupThree = '';
			$scope.searchGroupFour = '';

			$scope.refresh = function() {
				Groups.findByParent( { id: $scope.currentUser.tenant.primary_group_id }, function(res) {
					$scope.groupsTwo = res.data;
					$scope.mirrorGroupsTwo = angular.copy($scope.groupsTwo);
				});
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

			$scope.editGroup = function (group){

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

			Platform.whenReady(function() {
				$scope.refresh();
			});

		});
})();