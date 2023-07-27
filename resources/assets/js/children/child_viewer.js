(function() {

    angular.module('BuscaAtivaEscolar')
        .controller('ChildViewCtrl', ChildViewCtrl)

    .config(function($stateProvider) {
        $stateProvider
            .state('child_viewer', {
                url: '/children/view/{child_id}',
                templateUrl: '/views/children/view/viewer.html',
                controller: 'ChildViewCtrl'
            })
    });

    function ChildViewCtrl($scope, $state, $stateParams, Children, Decorators, StaticData, Modals, Groups, ngToast, Cases, Identity) {
        if ($state.current.name === "child_viewer") $state.go('.consolidated');

        $scope.Decorators = Decorators;
        $scope.Children = Children;
        $scope.StaticData = StaticData;
        $scope.identity = Identity;
        $scope.currentUser = Identity.getCurrentUser();

        $scope.refreshChildData = function(callback) {
            return $scope.child = Children.find({ id: $scope.child_id, with: 'currentCase' }, callback);
        };

        $scope.child_id = $stateParams.child_id;
        $scope.child = $scope.refreshChildData();

        $scope.assignGroup = function() {

            Modals.show(
                Modals.GroupPicker(
                    'Atribuir caso grupo',
                    'O caso ficará visível para o grupo selecionado.',
                    $scope.identity.getCurrentUser().group,
                    'Atribuindo caso ao grupo: ',
                    false,
                    null,
                    null,
                    true,
                    'Nenhum grupo selecionado')
            ).then(function(selectedGroup) {

                var detachUser = true;

                if ($scope.child.currentCase.currentStep.hasOwnProperty('assigned_user')) {
                    //se tem usuário assinado para o caso

                    Groups.findByIdWithParents({ id: selectedGroup.id }).$promise
                        .then(function(group) {

                            //verifica se o grupo do usuário atribuido ao caso é igual ou um dos pais do novo grupo selecionado
                            if ($scope.isFatherOrSameGroup($scope.child.currentCase.currentStep.assigned_user.group, group.data[0])) {
                                detachUser = false;
                            }

                            var currentCase = {
                                id: $scope.child.currentCase.id,
                                group_id: selectedGroup.id,
                                detach_user: detachUser
                            };

                            Cases.update(currentCase).$promise
                                .then(function(res) {
                                    ngToast.success('Caso atribuído com sucesso!')
                                    $state.go('child_browser');
                                });

                        });

                } else {
                    //se não tem usuário assinado para o caso

                    var currentCase = {
                        id: $scope.child.currentCase.id,
                        group_id: selectedGroup.id,
                        detach_user: detachUser
                    };

                    Cases.update(currentCase).$promise
                        .then(function() {
                            ngToast.success('Caso atribuído com sucesso!')
                            $state.go('child_browser');
                        });
                }

            }).then(function() {

            });

        };

        $scope.canAssignGroup = function() {
            if ($scope.child.currentCase) {
                if ($scope.child.currentCase.case_status != "in_progress") { return false; }
                if ($scope.child.currentCase.currentStep.assigned_user) {
                    if ($scope.child.currentCase.currentStep.assigned_user.type === "coordenador_estadual" || $scope.child.currentCase.currentStep.assigned_user.type === "supervisor_estadual") {
                        return false;
                    }
                }
            }
            if (!$scope.isCaseOfTenantOfUserLogged()) { return false; }
            return true;
        };

        $scope.isCaseOfTenantOfUserLogged = function() {
            if ($scope.identity.getCurrentUser().tenant_id) {
                if ($scope.identity.getCurrentUser().tenant_id == $scope.child.tenant_id) {
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        };

        //verifica se rootGroup é um dos pais de groupTobeChecked ou o mesmo
        $scope.isFatherOrSameGroup = function(rootGroup, groupTobeChecked) {
            if (groupTobeChecked.id == rootGroup.id) { return true; }
            var isFather = false;
            if (groupTobeChecked.parent != null) {
                if (groupTobeChecked.parent.id == rootGroup.id) { isFather = true; }
                if (groupTobeChecked.parent.parent != null) {
                    if (groupTobeChecked.parent.parent.id == rootGroup.id) { isFather = true; }
                    if (groupTobeChecked.parent.parent.parent != null) {
                        if (groupTobeChecked.parent.parent.parent.id == rootGroup.id) { isFather = true; }
                    }
                }
            }
            return isFather;
        };

    }

})();