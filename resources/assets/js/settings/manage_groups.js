(function() {

    angular.module('BuscaAtivaEscolar')
        .controller('ManageGroupsCtrl', function($scope, $window, $filter, $rootScope, $q, ngToast, Platform, Identity, Groups, StaticData, Modals) {

            $scope.groups = []
            $scope.getName = function(index) {
                document.getElementById('group_for_edition_two').value = $scope.groups[index - 1].name
                $scope.groupForEditionTwo['name'] = $scope.groups[index - 1].name
                $scope.groups = []
                document.getElementById("names").style.display = "none";
            };

            $scope.currentUser = Identity.getCurrentUser();

            $scope.groupsTwo = [];
            $scope.groupsThree = [];
            $scope.groupsFour = [];

            $scope.mirrorGroupsTwo = [];
            $scope.mirrorGroupsThree = [];
            $scope.mirrorGroupsFour = [];

            $scope.selectedTabTwo = null;
            $scope.selectedTabThree = null;
            $scope.selectedTabFour = null;

            $scope.groupForEditionTwo = { id: null, name: null, parent_id: null };
            $scope.groupForEditionThree = { id: null, name: null, parent_id: null };
            $scope.groupForEditionFour = { id: null, name: null, parent_id: null };

            $scope.refresh = function() {

                $scope.reloadAllData();

                Groups.findByParent({ id: $scope.currentUser.tenant.primary_group_id }, function(res) {
                    $scope.groupsTwo = res.data;
                    $scope.mirrorGroupsTwo = angular.copy($scope.groupsTwo);

                    $scope.groupsThree = [];
                    $scope.mirrorGroupsThree = angular.copy($scope.groupsThree);

                    $scope.groupsFour = [];
                    $scope.mirrorGroupsFour = angular.copy($scope.groupsFour);

                    $scope.groupForEditionTwo = { id: null, name: null, parent_id: $scope.currentUser.tenant.primary_group_id };
                });
            };


            $scope.editGroupTwo = function(group) {
                $scope.groupForEditionTwo = angular.copy(group);
                var getElementToFocus = $window.document.getElementById("group_for_edition_two");
                getElementToFocus.focus();
            };

            $scope.updateGroupTwo = function() {

                if ($scope.groupForEditionTwo.name) {
                    if ($scope.groupForEditionTwo.name.length >= 3) {

                        var type_register = 'criação';
                        if ($scope.groupForEditionTwo.id) { type_register = 'edição'; }

                        if (window.confirm('Confirma a ' + type_register + ' do grupo ' + $scope.groupForEditionTwo.name + '?')) {
                            $scope.executeUpdateGroupTwo($scope.groupForEditionTwo);
                        } else {
                            $scope.refresh();
                        }

                    }
                }

            };

            $scope.executeUpdateGroupTwo = function(group) {

                if (group.id == null) {
                    var promiseGroup = Groups.create(group).$promise
                } else {
                    var promiseGroup = Groups.update(group).$promise
                }
                promiseGroup.then(function(res) {
                    if (!res.group.hasOwnProperty('uf')) {
                        ngToast.warning('Grupo já existe!')
                        $scope.groups = []
                        for (let i = 0; i < 5; ++i) {
                            $scope.groups.push({ name: res.group[i] })
                        }
                        document.getElementById("names").style.display = "block";
                    } else {
                        ngToast.success('Grupo salvo com sucesso!')
                        $scope.refresh();
                    }
                }, function(err) {
                    ngToast.danger('Ocorreu um erro ao salvar os grupos!')
                    $scope.refresh();
                });

            };


            $scope.editGroupThree = function(group) {
                $scope.groupForEditionThree = angular.copy(group);
                var getElementToFocus = $window.document.getElementById("group_for_edition_three");
                getElementToFocus.focus();
            };

            $scope.updateGroupThree = function() {

                if ($scope.groupForEditionThree.name) {
                    if ($scope.groupForEditionThree.name.length >= 3) {

                        var type_register = 'criação';
                        if ($scope.groupForEditionThree.id) { type_register = 'edição'; }

                        if (window.confirm('Confirma a ' + type_register + ' do grupo' + $scope.groupForEditionThree.name + '?')) {
                            $scope.executeUpdateGroupThree($scope.groupForEditionThree);
                        } else {
                            $scope.onSelectGroup(2, group.parent_id);
                        }

                    }
                }

            };

            $scope.executeUpdateGroupThree = function(group) {

                if (group.id == null) {
                    var promiseGroup = Groups.create(group).$promise
                } else {
                    var promiseGroup = Groups.update(group).$promise
                }
                promiseGroup.then(function(res) {
                    ngToast.success('Grupo salvo com sucesso!')
                    $scope.onSelectGroup(2, group.parent_id);
                }, function(err) {
                    ngToast.danger('Ocorreu um erro ao salvar os grupos!')
                    $scope.onSelectGroup(2, group.parent_id);
                });

            };


            $scope.editGroupFour = function(group) {
                $scope.groupForEditionFour = angular.copy(group);
                var getElementToFocus = $window.document.getElementById("group_for_edition_four");
                getElementToFocus.focus();
            };

            $scope.updateGroupFour = function() {

                if ($scope.groupForEditionFour.name) {
                    if ($scope.groupForEditionFour.name.length >= 3) {

                        var type_register = 'criação';
                        if ($scope.groupForEditionFour.id) { type_register = 'edição'; }

                        if (window.confirm('Confirma a ' + type_register + ' do grupo ' + $scope.groupForEditionFour.name + '?')) {
                            $scope.executeUpdateGroupFour($scope.groupForEditionFour);
                        } else {
                            $scope.onSelectGroup(3, group.parent_id);
                        }

                    }
                }

            };

            $scope.executeUpdateGroupFour = function(group) {

                if (group.id == null) {
                    var promiseGroup = Groups.create(group).$promise
                } else {
                    var promiseGroup = Groups.update(group).$promise
                }
                promiseGroup.then(function(res) {
                    ngToast.success('Grupo salvo com sucesso!')
                    $scope.onSelectGroup(3, group.parent_id);
                }, function(err) {
                    ngToast.danger('Ocorreu um erro ao salvar os grupos!')
                    $scope.onSelectGroup(3, group.parent_id);
                });

            };


            $scope.removeGroup = function(group) {
                alert(group.name);
            };

            $scope.onSelectGroup = function(number, id) {

                if (number == 2) {
                    $scope.selectedTabTwo = id;
                    Groups.findByParent({ id: id }, function(res) {
                        $scope.groupsThree = res.data;
                        $scope.mirrorGroupsThree = angular.copy($scope.groupsThree);
                        $scope.groupsFour = [];
                        $scope.mirrorGroupsFour = angular.copy($scope.groupsFour);
                        $scope.groupForEditionThree = { id: null, name: null, parent_id: id };
                    });

                    $scope.selectedTabThree = null;
                    $scope.selectedTabFour = null;
                }

                if (number == 3) {
                    $scope.selectedTabThree = id;
                    Groups.findByParent({ id: id }, function(res) {
                        $scope.groupsFour = res.data;
                        $scope.mirrorGroupsFour = angular.copy($scope.groupsFour);
                        $scope.groupForEditionFour = { id: null, name: null, parent_id: id };
                    });

                    $scope.selectedTabFour = null;
                }

                if (number == 4) {
                    $scope.selectedTabFour = id;
                }

            };

            $scope.filterGroups = function(group) {
                if (group === "two") {
                    $scope.mirrorGroupsTwo = $filter("filter")($scope.groupsTwo, {
                        $: $scope.searchGroupTwo
                    });
                }
                if (group === "three") {
                    $scope.mirrorGroupsThree = $filter("filter")($scope.groupsThree, {
                        $: $scope.searchGroupThree
                    });
                }
                if (group === "four") {
                    $scope.mirrorGroupsFour = $filter("filter")($scope.groupsFour, {
                        $: $scope.searchGroupFour
                    });
                }
            };

            $scope.reloadAllData = function() {
                $scope.groupsTwo = [];
                $scope.groupsThree = [];
                $scope.groupsFour = [];

                $scope.mirrorGroupsTwo = [];
                $scope.mirrorGroupsThree = [];
                $scope.mirrorGroupsFour = [];

                $scope.selectedTabTwo = null;
                $scope.selectedTabThree = null;
                $scope.selectedTabFour = null;

                $scope.groupForEditionTwo = { id: null, name: null, parent_id: null };
                $scope.groupForEditionThree = { id: null, name: null, parent_id: null };
                $scope.groupForEditionFour = { id: null, name: null, parent_id: null };
            };

            Platform.whenReady(function() {
                $scope.refresh();
            });

        });
})();