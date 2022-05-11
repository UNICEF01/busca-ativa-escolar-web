(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('pending_alerts', {
                url: '/pending_alerts',
                templateUrl: '/views/children/pending_alerts.html',
                controller: 'PendingAlertsCtrlCtrl'
            })
        })
        .controller('PendingAlertsCtrlCtrl', function($scope, Groups, Platform, Identity, Alerts, StaticData, Modals, ngToast) {

            $scope.static = StaticData;
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

            //checkboxes
            $scope.check_all_alerts = false;
            $scope.selected = {
                alerts: []
            };
            $scope.onCheckSelectAllAlerts = function() {
                if ($scope.check_all_alerts) {
                    $scope.selected.alerts = angular.copy($scope.children.data);
                } else {
                    $scope.selected.alerts = [];
                }
            };
            $scope.changeAllGroups = function() {
                if ($scope.selected.alerts.length <= 0) {
                    Modals.show(Modals.Alert('Atenção', 'Selecione os alertas que deseja modificar'));
                } else {
                    Modals.show(
                        Modals.GroupPicker(
                            'Atribuir alertas ao grupo',
                            'Selecione o grupo para onde deseja encaminhar os alertas',
                            Identity.getCurrentUser().group,
                            'Atribuindo alertas ao grupo: ',
                            false,
                            null,
                            null,
                            true,
                            'Nenhum grupo selecionado')
                    ).then(function(selectedGroup) {

                        var obj = {
                            newObject: selectedGroup,
                            alerts: $scope.selected.alerts
                        };

                        return Alerts.changeGroups(obj).$promise;

                    }).then(function(res) {
                        if (res.status == "ok") {
                            ngToast.success("Grupos editados com sucesso.");
                            $scope.check_all_alerts = false;
                            $scope.selected.alerts = [];
                            $scope.refresh();
                        } else {
                            ngToast.danger("Ocorreu um erro ao editar os grupos.");
                        }
                    });
                }
            }

            $scope.search = {};

            $scope.changeGroup = function() {
                Modals.show(
                    Modals.GroupPicker(
                        'Filtrar alertas que pertencem ao grupo',
                        'Selecione o grupo que deseja filtrar',
                        Identity.getCurrentUser().group,
                        'Filtrando alertas do grupo: ',
                        false,
                        null,
                        null,
                        true,
                        'Nenhum grupo selecionado')
                ).then(function(selectedGroup) {
                    $scope.selectedGroup = selectedGroup;
                    $scope.query.group_id = $scope.selectedGroup.id;
                }).then(function() {

                });
            };

            $scope.updateGroup = function() {
                Modals.show(
                    Modals.GroupPicker(
                        'Atribuir aleta ao grupo',
                        'O alerta ficará visível para o grupo selecionado.', { id: Identity.getCurrentUser().tenant.primary_group_id, name: Identity.getCurrentUser().tenant.primary_group_name },
                        'Atribuindo grupo: ',
                        false,
                        null,
                        null,
                        true,
                        'Nenhum grupo selecionado', )
                ).then(function(selectedGroup) {
                    $scope.child.group_name = selectedGroup.name
                    $scope.child.group_id = selectedGroup.id
                    $scope.editAlert([$scope.child.group_name, $scope.child.group_id], 'groups', $scope.child.id)
                }).then(function() {

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
            };

            $scope.reloadAlerts = function() {
                $scope.query.page = 1;
                $scope.refresh();
            };

            $scope.refresh = function() {

                $scope.child = null;
                $scope.isLoading = true;

                Alerts.getPending($scope.query).$promise
                    .then(function(res) {

                        $scope.children = res;
                        $scope.search = $scope.children;

                        $scope.isLoading = false;
                        $scope.check_all_alerts = false;
                        $scope.selected.alerts = [];

                    });

            };

            $scope.preview = function(child) {
                $scope.child = child
                $('#modalChild').modal({
                    keyboard: false,
                });
            };

            $scope.close = function() {
                $('#modalChild').modal('hide');
            }

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
                Alerts.accept({ id: child.id, place_address: child.alert.place_address, place_neighborhood: child.alert.place_neighborhood, group_id: child.group_id, group_name: child.group_name }, function() {
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

            $scope.editAlert = function(data, type, id) {
                if (type == 'groups')
                    Alerts.edit({ id: id, data: data, type: type }, function() {
                        $scope.refresh();
                        $('#modalChild').modal('hide');
                    })
                else
                    Alerts.edit({ id: id, data: data, type: type }, function() {})
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