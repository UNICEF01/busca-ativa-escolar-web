(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('RemoveGroupPickerModalCtrl', function RemoveGroupPickerModalCtrl($scope, $filter, ngToast, $uibModalInstance, Groups, Identity, title, message, initialGroup, messageButton, isMovement, toBeRemoved, levelOfToBeRemoved, canDismiss, noGroupsMessage) {

            $scope.identity = Identity;
            $scope.title = title;
            $scope.message = message;
            $scope.canDismiss = canDismiss;
            $scope.noGroupsMessage = noGroupsMessage;
            $scope.messageButton = messageButton;

            $scope.isMovement = isMovement;
            $scope.groupToBeRemoved = toBeRemoved;
            $scope.levelOfToBeRemoved = levelOfToBeRemoved;

            $scope.selectedGroup = null;
            $scope.selectedLevelGroup = null;

            $scope.groupsOne = [];
            $scope.groupsTwo = [];
            $scope.groupsThree = [];
            $scope.groupsFour = [];

            $scope.mirrorGroupsOne = [];
            $scope.mirrorGroupsTwo = [];
            $scope.mirrorGroupsThree = [];
            $scope.mirrorGroupsFour = [];

            $scope.selectedTabOne = null;
            $scope.selectedTabTwo = null;
            $scope.selectedTabThree = null;
            $scope.selectedTabFour = null;

            $scope.refresh = function() {

                $scope.groupsOne = [{
                    id: initialGroup.id,
                    name: initialGroup.name
                }];
                $scope.mirrorGroupsOne = angular.copy($scope.groupsOne);

                $scope.groupsTwo = [];
                $scope.mirrorGroupsTwo = angular.copy($scope.groupsTwo);

                $scope.groupsThree = [];
                $scope.mirrorGroupsThree = angular.copy($scope.groupsThree);

                $scope.groupsFour = [];
                $scope.mirrorGroupsFour = angular.copy($scope.groupsFour);

            };

            $scope.onSelectGroup = function(number, group) {

                if (number == 1) {
                    $scope.selectedTabOne = group.id;
                    Groups.findByParent({ id: group.id }, function(res) {
                        $scope.groupsTwo = res.data;
                        $scope.mirrorGroupsTwo = angular.copy($scope.groupsTwo);
                        $scope.groupsThree = [];
                        $scope.mirrorGroupsThree = angular.copy($scope.groupsThree);
                        $scope.groupsFour = [];
                        $scope.mirrorGroupsFour = angular.copy($scope.groupsFour);
                    });
                }

                if (number == 2) {
                    $scope.selectedTabTwo = group.id;
                    Groups.findByParent({ id: group.id }, function(res) {
                        $scope.groupsThree = res.data;
                        $scope.mirrorGroupsThree = angular.copy($scope.groupsThree);
                        $scope.groupsFour = [];
                        $scope.mirrorGroupsFour = angular.copy($scope.groupsFour);
                    });
                }

                if (number == 3) {
                    $scope.selectedTabThree = group.id;
                    Groups.findByParent({ id: group.id }, function(res) {
                        $scope.groupsFour = res.data;
                        $scope.mirrorGroupsFour = angular.copy($scope.groupsFour);
                    });
                }

                if (number == 4) {
                    $scope.selectedTabFour = group.id;
                }

                $scope.selectedGroup = group;
                $scope.selectedLevelGroup = number;

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

            $scope.onConfirm = function() {

                if (!$scope.selectedGroup) {
                    ngToast.danger('Você não selecionou nenhum grupo!');
                    return;
                }

                if ($scope.isMovement) {

                    if ($scope.levelOfToBeRemoved == 1 || $scope.levelOfToBeRemoved == 4 || ($scope.levelOfToBeRemoved == 3 && $scope.identity.getCurrentUser().tenant.is_state) ) {
                        ngToast.danger('Grupo selecionado não pode ser removido!');
                        return;
                    }

                    if ($scope.levelOfToBeRemoved != $scope.selectedLevelGroup) {
                        ngToast.danger('Não é permitido selecionar um grupo de nível diferente do que está sendo removido.');
                        return;
                    }

                    if ($scope.groupToBeRemoved.id == $scope.selectedGroup.id) {
                        ngToast.danger('Não é permitido selecionar o mesmo grupo');
                        return;
                    }

                }
                
                $uibModalInstance.close({ response: $scope.selectedGroup });
            };

            $scope.close = function() {
                $uibModalInstance.dismiss(false);
            };

            $scope.refresh();

        });

})();