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

            $scope.groups2 = []
            $scope.getName2 = function(index) {
                document.getElementById('group_for_edition_three').value = $scope.groups2[index - 1].name
                $scope.groupForEditionThree['name'] = $scope.groups2[index - 1].name
                $scope.groups2 = []
                document.getElementById("names2").style.display = "none";
            };

            $scope.groups3 = []
            $scope.getName3 = function(index) {
                document.getElementById('group_for_edition_four').value = $scope.groups3[index - 1].name
                $scope.groupForEditionFour['name'] = $scope.groups3[index - 1].name
                $scope.groups3 = []
                document.getElementById("names3").style.display = "none";
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
                    var msg = 'Grupo salvo com sucesso!';
                    var promiseGroup = Groups.create(group).$promise
                } else {
                    var msg = 'Grupo alterado com sucesso!';
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
                        ngToast.success(msg)
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

                        if (window.confirm('Confirma a ' + type_register + ' do grupo ' + $scope.groupForEditionThree.name + '?')) {
                            $scope.executeUpdateGroupThree($scope.groupForEditionThree);
                        } else {
                            $scope.onSelectGroup(2, group.parent_id);
                        }

                    }
                }

            };

            $scope.executeUpdateGroupThree = function(group) {

                if (group.id == null) {
                    var msg = 'Grupo salvo com sucesso!';
                    var promiseGroup = Groups.create(group).$promise
                } else {
                    var msg = 'Grupo alterado com sucesso!';
                    var promiseGroup = Groups.update(group).$promise
                }
                promiseGroup.then(function(res) {
                    if (!res.group.hasOwnProperty('uf')) {
                        ngToast.warning('Grupo já existe!')
                        $scope.groups2 = []
                        for (let i = 0; i < 5; ++i) {
                            $scope.groups2.push({ name: res.group[i] })
                        }
                        document.getElementById("names2").style.display = "block";
                    } else {
                        ngToast.success(msg)
                        $scope.onSelectGroup(2, group.parent_id);
                    }
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
                    var msg = 'Grupo salvo com sucesso!';
                    var promiseGroup = Groups.create(group).$promise
                } else {
                    var msg = 'Grupo alterado com sucesso!';
                    var promiseGroup = Groups.update(group).$promise
                }
                promiseGroup.then(function(res) {
                        if (!res.group.hasOwnProperty('uf')) {
                            ngToast.warning('Grupo já existe!')
                            $scope.groups3 = []
                            for (let i = 0; i < 5; ++i) {
                                $scope.groups3.push({ name: res.group[i] })
                            }
                            document.getElementById("names3").style.display = "block";
                        } else {
                            ngToast.success(msg)
                            $scope.onSelectGroup(3, group.parent_id);
                        }
                    },
                    function(err) {
                        ngToast.danger('Ocorreu um erro ao salvar os grupos!')
                        $scope.onSelectGroup(3, group.parent_id);
                    });

            };


            $scope.canMovGroup = function (level) {
                if (level==3){ return true; }
                if (level==4){ if(!$scope.currentUser.tenant.is_state){ return true; } }
                return false;
            };

            $scope.userCanMovGroup = function (level, group) {
                if(level==2) { return false; }
                if (level==3){
                    if($scope.currentUser.group.is_primary) { return true; }
                    if($scope.selectedTabTwo == $scope.currentUser.group.id) { return true; }
                }
                if (level==4){
                    if($scope.currentUser.group.is_primary) { return true; }
                    if($scope.selectedTabTwo == $scope.currentUser.group.id || $scope.selectedTabThree == $scope.currentUser.group.id) { return true; }
                }
                return false;
            };


            $scope.canEditGroup = function (level, group) {
                if(level==2){ return true; }
                if(level==3){
                    if($scope.currentUser.tenant.is_state) { return false; }
                    if(!$scope.currentUser.tenant.is_state) { return true; }
                }
                if(level==4){ return false; }
                return false;
            };

            $scope.userCanEditGroup = function (level, group) {
                if($scope.currentUser.group.is_primary) { return true; }
                if(level==3){
                    if($scope.currentUser.group.is_primary) { return true; }
                    if($scope.selectedTabTwo == $scope.currentUser.group.id) { return true; }
                }
                if(level==4){
                    if($scope.currentUser.group.is_primary) { return true; }
                    if($scope.selectedTabTwo == $scope.currentUser.group.id || $scope.selectedTabThree == $scope.currentUser.group.id) { return true; }
                }
                return false;
            };


            $scope.disableNewGroup = function (level){
                if(level==2){
                    if($scope.currentUser.group.is_primary) { return false; }
                }
                if(level==3){
                    if($scope.selectedTabTwo == null){
                        return true;
                    }else{
                        if($scope.currentUser.tenant.is_state) { return  true; }
                        if($scope.currentUser.group.is_primary) { return false; }
                        if($scope.selectedTabTwo == $scope.currentUser.group.id) { return false; }
                    }
                }
                return true;
            };


            $scope.movGroup = function (level, group) {
                Modals.show(
                    Modals.GroupPicker(
                        'Movimentar grupo '+group.name,
                        'Selecione o grupo para onde deseja mover o grupo selecionado. Todos os alertas, casos e usuários que pertencem a esse grupo também serão movidos. Essa operação não poderá ser desfeita.',
                        { id: Identity.getCurrentUser().tenant.primary_group_id, name: Identity.getCurrentUser().tenant.primary_group_name },
                        'Movendo para: ',
                        true,
                        group,
                        level,
                        true,
                        'Nenhum grupo selecionado')
                ).then(function(selectedGroup) {
                    var groupToBeEdited = {
                        parent_id: selectedGroup.id,
                        id: group.id
                    };
                    return Groups.update(groupToBeEdited);
                }).then(function(res) {
                    ngToast.success('Grupo movimentado com sucesso!')
                    $scope.refresh();
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