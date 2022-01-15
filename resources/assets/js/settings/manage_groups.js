(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageGroupsCtrl', function ($scope, $rootScope, $q, ngToast, Platform, Identity, Groups, StaticData) {

			$scope.groups = [];
			$scope.newGroupName = '';

			$scope.getGroups = function() {
				if(!$scope.groups) return [];
				return $scope.groups;
			};

			$scope.removeGroup = function(i) {
				if(!$scope.groups[i]) return;

				if($scope.groups[i].is_creating) {
					delete $scope.groups[i];
					return;
				}

				$scope.groups[i].is_deleting = true;

                $scope.save();
			};

			$scope.cancelRemoval = function (i) {
				if(!$scope.groups[i]) return;
				$scope.groups[i].is_deleting = false;
			};

			$scope.save = function() {

				var promises = [];

				for(var i in $scope.groups) {
					if(!$scope.groups.hasOwnProperty(i)) continue;

					var group = $scope.groups[i];

					if(group.is_deleting && !group.is_primary) {
						promises.push(Groups.delete({id: group.id}).$promise);
						//console.log("\t [groups.save] REMOVED, DELETE-> Group #" + i + ': ', group);
						continue;
					}

					if(group.is_creating) {
						promises.push(Groups.create({name: group.name}).$promise);
						//console.log("\t [groups.save] NEW, CREATE-> Group #" + i + ': ', group);
						continue;
					}

					if($scope.groupsEdit['group_' + i] && !$scope.groupsEdit['group_' + i].$pristine) {
						promises.push(Groups.update({id: group.id, name: group.name}).$promise);
						//console.log("\t [groups.save] MODIFIED, UPDATE -> Group #" + i + ': ', group);
						continue;
					}

					//console.log("\t [groups.save] PRISTINE, NOOP -> Group #" + i + ': ', group);

				}

				$q.all(promises).then(function(res) {
					console.info('[groups.save] Saved! ', res);
					ngToast.success('Grupos alterados com sucesso!')
					$scope.refresh();
				}, function (err) {
					console.error('[groups.save] Error: ', err);
					ngToast.danger('Ocorreu um erro ao salvar os grupos!')
					$scope.refresh();
				});
			};

			$scope.addGroup = function() {
				if(!$scope.newGroupName) return;
				if($scope.newGroupName.length < 5) return;

				var group = {
					name: $scope.newGroupName,
					is_primary: false,
					is_creating: true
				};

				$scope.groups.push(group);

				$scope.newGroupName = '';
                $scope.save();
			};

            $scope.updateGroup = function(value,index) {

                if(!$scope.groups[index].name) return;
                if($scope.groups[index].name.length < 5) return;

				if(value !== $scope.groupsCopy[index].name){
                    $scope.save();

                }
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

		});

})();