(function() {

	angular.module('BuscaAtivaEscolar')
		.config(function ($stateProvider) {
			$stateProvider.state('pending_alerts', {
				url: '/pending_alerts',
				templateUrl: '/views/children/pending_alerts.html',
				controller: 'PendingAlertsCtrlCtrl'
			})
		})
		.controller('PendingAlertsCtrlCtrl', function ($scope, Platform, Identity, Alerts, Groups,StaticData) {

			$scope.identity = Identity;
			$scope.sendingAlert = false;
			$scope.children = {};
			$scope.child = {};
					
			$scope.query = {
                name: null,
				submitter_name: null,
                sort: {},
                max: 16,
				page: 1,
				neighborhood: null,
				city_name: null,
				alert_cause_id: null,
				show_suspended: false,
				group_id: null,
            };

			$scope.groups =  [];
            if($scope.groups.length == 0){
                Groups.findUserGroups(function(res){
                    res.data.forEach(function(v){
                        $scope.groups.push(({value: v.id, displayName: v.name}));
                        const size = Object.keys(v).length;
                        if(size > 2){
                            for(let i  = 0; i < size - 2; ++i){
                                v[i].name = v[i].name.trim()
                                v[i].name = Array(6).fill('\xa0').join('') + v[i].name
                                $scope.groups.push(({value: v[i].id, displayName: v[i].name}));
                                const size1 = Object.keys(v[i]).length;
                                if(size1 > 2){
                                    for(let j  = 0; j < size1 - 2; ++j){
                                        v[i][j].name = v[i][j].name.trim()
                                        v[i][j].name = Array(12).fill('\xa0').join('') + v[i][j].name
                                        $scope.groups.push(({value: v[i][j].id, displayName: v[i][j].name}));
                                        const size2 = Object.keys(v[i][j]).length;
                                        if(size2 > 2){
                                            for(let l  = 0; l < size2 - 2; ++l){
                                                v[i][j][l].name = v[i][j][l].name.trim()
                                                v[i][j][l].name = Array(18).fill('\xa0').join('') + v[i][j][l].name
                                                $scope.groups.push(({value: v[i][j][l].id, displayName: v[i][j][l].name}));
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                });
            }

			$(function() {
				$('#select_group_alert').bind("change", function() {
					var space_offset =7;
					var matches = $('#select_group_alert option:selected').text().search(/\S/);
					var number = matches == 23 ? 23: matches == 29 ? 50 : matches == 35 ? 78: '';
					$(this).css('text-indent', -(number));
				});
			});
			

            $scope.search = {};
			$scope.branchGroups = "carregando ...";
			
			$scope.getAlertCauseName = function(id) {
				if(!$scope.child) return 'err:no_child_open';
				if(!$scope.child.alert) return 'err:no_alert_data';
				if(!$scope.child.alert.alert_cause_id) return 'err:no_alert_cause_id';
				var indexAlertCauses = _.findIndex($scope.causes, {id: $scope.child.alert.alert_cause_id});
				if(!$scope.causes[indexAlertCauses]) return 'err:no_cause_with_id';
				return $scope.causes[indexAlertCauses].label;
			};


			$scope.clikcInGroup = function (group_id){
                $scope.branchGroups = "carregando ...";
                Groups.findByIdWithParents({id: group_id}, function (res){
                    var groupOfuserWithParents = res.data[0];
                    var groupsOfUser = [];
                    groupsOfUser.push(groupOfuserWithParents.name);
                    if ( groupOfuserWithParents.parent != null) {
                        groupsOfUser.push(groupOfuserWithParents.parent.name);
                        if ( groupOfuserWithParents.parent.parent != null) {
                            groupsOfUser.push(groupOfuserWithParents.parent.parent.name);
                            if ( groupOfuserWithParents.parent.parent.parent != null) {
                                groupsOfUser.push(groupOfuserWithParents.parent.parent.parent.name);
                            }
                        }
                    }
                    $scope.branchGroups = groupsOfUser.reverse().join(' > ');
                });
            };

            $scope.setMaxResults = function(max) {
                $scope.query.max = max;
                $scope.query.page = 1;
                $scope.refresh();
            };

			$scope.causes = [];

			$scope.static = StaticData;
			
			$scope.refresh = function() {
				$scope.child = null;
				$scope.children = Alerts.getPending($scope.query);
				$scope.search = $scope.children;
				angular.element('#select_parent').css('text-indent', 0);
			};

			$scope.preview = function(child) {
				$scope.child = child
				$('#modalChild').modal({
					keyboard: false,
				});
			};

			$scope.canAcceptAlert = function(child) {
				if(!child) return false;
				if(!child.requires_address_update) return true;
				return child.alert
					&& child.alert.place_address
					&& (child.alert.place_address.trim().length > 0)
					&& child.alert.place_neighborhood
					&& (child.alert.place_neighborhood.trim().length > 0);
			};

			$scope.getGroupOfCurrentUser = function (){
				return Identity.getCurrentUser().group;
			}


	
			$scope.getStringOfGroupsOfUser = function (){
				var groupOfuser = $scope.getGroupOfCurrentUser();		
				var stringForTooltip = "";			
				stringForTooltip += groupOfuser.name;	
			

				groupOfuser.children.forEach( function(group){
					stringForTooltip += " > " + group.name;			
						/*group.children.forEach( function(group2){										
							stringForTooltip += " > " + group2.name;							
							group2.children.forEach( function(group3){
								stringForTooltip += " > " + group3.name;
							});
						});*/
					
				});
				
				return stringForTooltip;						
				};

			$scope.accept = function(child) {
				if(!$scope.canAcceptAlert(child)) {
					return;
				}

				$scope.sendingAlert = true;

				Alerts.accept({id: child.id, place_address: child.alert.place_address, place_neighborhood: child.alert.place_neighborhood}, function() {
					$scope.refresh();
					$scope. child = {};
					$('#modalChild').modal('hide');
					$scope.sendingAlert = false;
				});
			};

			$scope.reject = function(child) {
				Alerts.reject({id: child.id}, function() {
					$scope.refresh();
					$scope.child = {};
					$('#modalChild').modal('hide');
				});
			};

			Platform.whenReady(function() {
				$scope.data  = StaticData.getAlertCauses();
				if($scope.causes.length == 0){
                    Object.values($scope.data).forEach(val => $scope.causes.push(({value: val.id, displayName: val.label})));
                    $scope.causes.sort((a,b) => (a.displayName > b.displayName) ? 1 : ((b.displayName > a.displayName) ? -1 : 0))		
                }
				$scope.refresh();
			});


		});

})();