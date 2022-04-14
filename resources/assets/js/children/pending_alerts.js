(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('pending_alerts', {
                url: '/pending_alerts',
                templateUrl: '/views/children/pending_alerts.html',
                controller: 'PendingAlertsCtrlCtrl'
            })
        })
        .controller('PendingAlertsCtrlCtrl', function($scope, Groups, Platform, Identity, Alerts, StaticData, Modals) {

            $scope.identity = Identity;
            $scope.sendingAlert = false;
            $scope.children = {};
            $scope.child = {};
            $scope.causes = {};
            $scope.causes_filter = [];

            $scope.query = {
                name: null,
                submitter_name: null,
                sort: {},
                max: 16,
                page: 1,
                neighborhood: null,
                show_suspended: false,
                group_id: null,
            };

            $scope.search = {};

            $scope.changeGroup = function() {
                Modals.show(
                    Modals.GroupPicker(
                        'Atribuir grupo ao alerta',
                        'O último grupo selecionado será atrinuído ao alerta:',
                        Identity.getCurrentUser().group,
                        true)
                ).then(function(selectedGroup) {
                    $scope.selectedGroup = selectedGroup;
                    $scope.query.group_id = $scope.selectedGroup.id;
                }).then(function(res) {

                });
            };

            $scope.branchGroups = "carregando ...";

            $scope.clikcInGroup = function(group_id) {
                $scope.branchGroups = "carregando ...";
                Groups.findByIdWithParents({ id: group_id }, function(res) {
                    var groupOfuserWithParents = res.data[0];
                    var groupsOfUser = [];
                    groupsOfUser.push(groupOfuserWithParents.name);
                    if (groupOfuserWithParents.parent != null) {
                        groupsOfUser.push(groupOfuserWithParents.parent.name);
                        if (groupOfuserWithParents.parent.parent != null) {
                            groupsOfUser.push(groupOfuserWithParents.parent.parent.name);
                            if (groupOfuserWithParents.parent.parent.parent != null) {
                                groupsOfUser.push(groupOfuserWithParents.parent.parent.parent.name);
                            }
                        }
                    }
                    $scope.branchGroups = groupsOfUser.reverse().join(' > ');
                });
            }

            $scope.getAlertCauseName = function(id) {
                if (!$scope.child) return 'err:no_child_open';
                if (!$scope.child.alert) return 'err:no_alert_data';
                if (!$scope.child.alert.alert_cause_id) return 'err:no_alert_cause_id';
                var indexAlertCauses = _.findIndex($scope.causes, { id: $scope.child.alert.alert_cause_id });
                if (!$scope.causes[indexAlertCauses]) return 'err:no_cause_with_id';
                return $scope.causes[indexAlertCauses].label;
            };

            $scope.setMaxResults = function(max) {
                $scope.query.max = max;
                $scope.query.page = 1;
                $scope.refresh();
            };

            $scope.static = StaticData;

            $scope.refresh = function() {
                $scope.child = null;
                $scope.children = Alerts.getPending($scope.query);
                $scope.search = $scope.children;
            };

            $scope.preview = function(child) {
                $scope.child = child
                $('#modalChild').modal({
                    keyboard: false,
                });
            };

            $scope.canAcceptAlert = function(child) {
                if (!child) return false;
                if (!child.requires_address_update) return true;
                return child.alert &&
                    child.alert.place_address &&
                    (child.alert.place_address.trim().length > 0) &&
                    child.alert.place_neighborhood &&
                    (child.alert.place_neighborhood.trim().length > 0);
            };

            $scope.getStringOfGroupsOfUser = function() {
                var groupOfuser = $scope.getGroupOfCurrentUser();
                var stringForTooltip = "";
                stringForTooltip += groupOfuser.name;
                groupOfuser.children.forEach(function(group) {
                    stringForTooltip += " > " + group.name;
                });

                return stringForTooltip;
            };

            $scope.accept = function(child) {
                if (!$scope.canAcceptAlert(child)) {
                    return;
                }

                $scope.sendingAlert = true;

                Alerts.accept({ id: child.id, place_address: child.alert.place_address, place_neighborhood: child.alert.place_neighborhood }, function() {
                    $scope.refresh();
                    $scope.child = {};
                    $('#modalChild').modal('hide');
                    $scope.sendingAlert = false;
                });
            };


            $scope.reject = function(child) {
                Alerts.reject({ id: child.id }, function() {
                    $scope.refresh();
                    $scope.child = {};
                    $('#modalChild').modal('hide');
                });
            };

            Platform.whenReady(function() {
                $scope.causes = StaticData.getAlertCauses();
                if ($scope.causes_filter.length == 0) {
                    Object.values($scope.causes).forEach(val => $scope.causes_filter.push(({ value: val.id, displayName: val.label })));
                    $scope.causes_filter.sort((a, b) => (a.displayName > b.displayName) ? 1 : ((b.displayName > a.displayName) ? -1 : 0))
                }
                $scope.selectedGroup = Identity.getCurrentUser().group;
                $scope.refresh();
            });

        });

})();