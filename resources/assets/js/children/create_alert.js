(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('child_create_from_alert', {
				url: '/children/create_alert',
				templateUrl: '/views/children/create_alert.html',
				controller: 'CreateAlertCtrl'
			})
		})
		.controller('CreateAlertCtrl', function ($scope, $state, ngToast, Utils, Identity, StaticData, Children, Cities, Groups, Platform) {

			$scope.identity = Identity;
			$scope.static = StaticData;
			$scope.disableCreateAlertButton = false;
			$scope.groups = [];
			$scope.allGroupsOfTenant = [];
			$scope.selectedGroup = null;



			$scope.birthdayDateEnd = moment(new Date()).format('YYYY-MM-DD');
			$scope.birthdayDateStart = moment($scope.birthdayDateEnd).subtract(100, 'years').format('YYYY-MM-DD');

			$scope.alert = {};

			$scope.fetchCities = function(query) {
				var data = {name: query, $hide_loading_feedback: true};
				if($scope.alert.place_uf) data.uf = $scope.alert.place_uf;

				//console.log("[create_alert] Looking for cities: ", data);

				return Cities.search(data).$promise.then(function (res) {
					return res.results;
				});

			};

			$scope.renderSelectedCity = function(city) {
				if(!city) return '';
				return city.uf + ' / ' + city.name;
			};


			
			$scope.createAlert = function() {

				$scope.disableCreateAlertButton = true;

				
				// TODO: validate fields
				var data = $scope.alert;
				data = Utils.prepareDateFields(data, ['dob']);
				data.place_city_id = data.place_city ? data.place_city.id : null;
				data.place_city_name = data.place_city ? data.place_city.name : null;
				data.group_id = $scope.selectedGroup.id;

//document.write(JSON.stringify(data))
			
				Children.spawnFromAlert(data).$promise.then(function (res) {
					if(res.messages) {
						console.warn("[create_alert] Failed validation: ", res.messages);
						$scope.disableCreateAlertButton = false;
						return Utils.displayValidationErrors(res);
					}
					
					if(!res || !res.child_id) {
						ngToast.danger('Ocorreu um erro ao registrar o alerta!');
						$scope.disableCreateAlertButton = false;
						return;
					}

					ngToast.success('Alerta registrado com sucesso!');

					$scope.disableCreateAlertButton = false;

					if(Identity.getType() === 'agente_comunitario') {
						$state.go('dashboard');
						return;
					}

					$state.go('child_viewer', {child_id: res.child_id});
				});
			}

			$scope.getGroupOfCurrentUser = function (){
				return Identity.getCurrentUser().group;
			}

			$scope.getGroupsToMove = function() {
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

			Platform.whenReady(function () {
				Groups.findGroupedGroups(function(res) {
					$scope.groups = res.data;
					$scope.allGroupsOfTenant = $scope.getGroupsToMove();
					$scope.selectedGroup = $scope.getGroupOfCurrentUser();
				});
			});

		});

})();



