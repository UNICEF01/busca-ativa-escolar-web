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
                    { id: $scope.identity.tenant.primary_group_id, name: $scope.identity.tenant.primary_group_name },
                    'Atribuindo grupo: ',
                    false,
                    null,
                    'Nenhum grupo selecionado',
                    true)
            ).then(function(selectedGroup) {

                var currentCase = {
                    id: $scope.child.currentCase.id,
                    group_id: selectedGroup.id,
                    detach_user: true
                };

                return Cases.update(currentCase, function(res) {
                    $state.go('child_browser');
                });

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

    }

})();