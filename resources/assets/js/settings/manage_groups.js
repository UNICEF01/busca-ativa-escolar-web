(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageGroupsCtrl', function ($scope, $filter, $rootScope, $q, ngToast, Platform, Identity, Groups, StaticData, Modals) {

			$scope.groupsTwo = [];
			$scope.groupsThree = [];
			$scope.groupsFour = [];

			$scope.mirrorGroupsTwo = [];
			$scope.mirrorGroupsThree = [];
			$scope.mirrorGroupsFour =  [];

			$scope.selectedTabTwo = '';
			$scope.selectedTabThree = '';
			$scope.selectedTabFour = '';

			$scope.refresh = function() {

				Groups.findGroupedGroups(function(res) {
					$scope.groups = res.data;
					$scope.groupsCopy = angular.copy($scope.groups);
				});

				//simulate
				$scope.groupsTwo = [
					{ name: "Regional 1", id: "0000-hhhh-6666-7777-3333" },
					{ name: "Regional 2", id: "0000-hhhh-6666-7777-3334" },
					{ name: "Regional 3", id: "0000-hhhh-6666-7777-3335" },
					{ name: "Regional 4", id: "0000-hhhh-6666-7777-3336" }
				];

				$scope.groupsThree = [
					{ name: "Taguatinga", id: "0000-hhhh-6666-7777-3333" },
					{ name: "Riacho Fundo", id: "0000-hhhh-6666-7777-3334" },
					{ name: "Santa Maria", id: "0000-hhhh-6666-7777-3335" },
					{ name: "Plano Piloto", id: "0000-hhhh-6666-7777-3336" }
				];

				$scope.groupsFour = [];

				for (var i = 0; i < 100; i++){
					$scope.groupsThree.push( { name: "Cidade "+i, id: "0000-hhhh-6666-7777-"+i } );
				}

				for (var i = 0; i < 1000; i++){
					$scope.groupsFour.push( { name: "Cantinho Feliz "+i, id: "0000-hhhh-6666-7777-4444"+i } );
				}

				$scope.mirrorGroupsTwo = angular.copy($scope.groupsTwo);
				$scope.mirrorGroupsThree = angular.copy($scope.groupsThree);
				$scope.mirrorGroupsFour = angular.copy($scope.groupsFour);
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
				console.log(group);
			};

			$scope.selectGroup = function (number, group){
				if (number == 2 ){ $scope.selectedTabTwo = group.id; }
				if (number == 3 ){ $scope.selectedTabThree = group.id; }
				if (number == 4 ){ $scope.selectedTabFour = group.id; }
			};

			Platform.whenReady(function() {
				$scope.refresh();
			});

		});
})();