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
                    'Atribuir grupo ao caso',
                    'O último grupo selecionado será atrubuído ao caso:',
                    { id: $scope.identity.getCurrentUser().tenant.primary_group_id, name: $scope.identity.getCurrentUser().tenant.primary_group_name },
                    'Atribuindo grupo: ',
                    false,
                    null,
                    null,
                    true,
                    'Nenhum grupo selecionado')
            ).then(function(selectedGroup) {

                var detachUser = false;

                if($scope.child.currentCase.currentStep.hasOwnProperty('assigned_user')){
                    //se tem usuário assinado para o caso

                    Groups.findById({id: $scope.child.currentCase.currentStep.assigned_user.group.id}).$promise
                        .then(function (group){

                            if ( $scope.needsToRemoveUser(group.data[0], selectedGroup) ){
                                detachUser = true;
                            } else {
                                detachUser = false;
                            }

                            var currentCase = {
                                id: $scope.child.currentCase.id,
                                group_id: selectedGroup.id,
                                detach_user: detachUser
                            };

                            Cases.update(currentCase).$promise
                                .then(function (res){
                                    ngToast.success('Grupo atribuído com sucesso!')
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
                        .then(function (res){
                            ngToast.success('Grupo atribuído com sucesso!')
                            $state.go('child_browser');
                        });
                }

            }).then(function(res) {

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

        //verifica se deve remover usuário do caso ao atribuir novo grupo
        $scope.needsToRemoveUser = function (groupOfuser, newGroupSelected){
            if (newGroupSelected.id == groupOfuser.id){ return false; }
            if (newGroupSelected.is_primary){ return true; }
            var needsToRemove = true;
            groupOfuser.children.forEach(function (group){
                if (group.id == newGroupSelected.id) { needsToRemove = false; }
                group.children.forEach(function (group2){
                    if (group2.id == newGroupSelected.id) { needsToRemove = false; }
                    group2.children.forEach(function (group3){
                        if (group3.id == newGroupSelected.id) { needsToRemove = false; }
                    });
                });
            });
            return needsToRemove;
        };

    }

})();