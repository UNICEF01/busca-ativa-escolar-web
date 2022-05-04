(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('UserPickerModalCtrl', function UserPickerModalCtrl($scope, ngToast, $uibModalInstance, title, message, users, caseGroups, canDismiss, noUsersMessage) {

            $scope.title = title;
            $scope.message = message;
            $scope.canDismiss = canDismiss;
            $scope.noUsersMessage = noUsersMessage;

            $scope.selectedUser = { id: null };
            $scope.users = users;
            $scope.caseGroups = caseGroups;

            $scope.hasUsers = function() {
                if (!$scope.users) return false;
                return ($scope.users.length > 0);
            };

            $scope.onSelect = function() {
                if (!$scope.selectedUser.id) {
                    ngToast.danger('Você não selecionou nenhum usuário!');
                    return;
                }
                $uibModalInstance.close({ response: $scope.selectedUser.id });
            };

            $scope.close = function() {
                $uibModalInstance.dismiss(false);
            };

            $scope.getGroupWithUsers = function() {
                var groups = [];
                $scope.caseGroups.forEach(function(group) {
                    group.users = $scope.getUsersOfGroup(group);
                    groups.push(group);
                });
                return groups;
            };

            $scope.getUsersOfGroup = function(group) {
                var finalGroup = [];
                $scope.users.forEach(function(user) {
                    if (user.group.id == group.id) {
                        finalGroup.push(user);
                    }
                });
                return finalGroup;
            };

        });

})();