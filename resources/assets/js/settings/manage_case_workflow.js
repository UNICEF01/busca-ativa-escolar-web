(function() {

	angular.module('BuscaAtivaEscolar')
		.controller('ManageCaseWorkflowCtrl', function ($scope, $rootScope, $q, ngToast, Platform, Identity, Tenants, Groups, StaticData) {

			$scope.static = StaticData;

			$scope.groups = [];
			$scope.settings = {};

			$scope.getGroups = function() {
				return $scope.groups;
			};

			$scope.save = function() {

                for(var index_g in $scope.groups){
                	if( index_g == 0){
                    	var alerts = $scope.groups[index_g].settings.alerts;
                        for(var index_a in alerts){
                        	if(index_a != 500 && index_a != 600 && alerts[index_a] == false){
                                ngToast.danger('O grupo principal, obrigatoriamente, deve estar selecionado para todos os motivos de evasão escolar!');
                        		return;
							}
						}
                	}
                }

				var promises = [];

				for(var i in $scope.groups) {
					if(!$scope.groups.hasOwnProperty(i)) continue;
					promises.push( Groups.updateSettings($scope.groups[i]).$promise );

					//add subgroups
					for (var j in $scope.groups[i].children){
						if(!$scope.groups[i].children.hasOwnProperty(j)) continue;
						promises.push( Groups.updateSettings($scope.groups[i].children[j]).$promise );
						for (var k in $scope.groups[i].children[j].children){
							if(!$scope.groups[i].children[j].children.hasOwnProperty(k)) continue;
							promises.push( Groups.updateSettings($scope.groups[i].children[j].children[k]).$promise );
							for (var l in $scope.groups[i].children[j].children[k].children){
								if(!$scope.groups[i].children[j].children[k].children.hasOwnProperty(l)) continue;
								promises.push( Groups.updateSettings($scope.groups[i].children[j].children[k].children[l]).$promise );
							}
						}
					}

				}

				promises.push( Tenants.updateSettings($scope.settings).$promise );

				$q.all(promises).then(
					function (res) {
						ngToast.success('Configurações salvas com sucesso!');
						$scope.refresh();
					}, function (err) {
						ngToast.danger('Ocorreu um erro ao salvar as configurações!');
						console.error('[manage_case_workflow.save] Error: ', err);
					}
				);

			};

			$scope.refresh = function() {
				Groups.findGroupedGroups(function(res) {
					$scope.groups = res.data;
				});

				Tenants.getSettings(function (res) {
					$scope.settings = res;
				});
			};

			Platform.whenReady(function() {
				$scope.refresh();
			})

		});

})();