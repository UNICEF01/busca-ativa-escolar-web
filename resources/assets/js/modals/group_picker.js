(function() {

    angular
        .module('BuscaAtivaEscolar')
        .controller('GroupPickerModalCtrl', function GroupPickerModalCtrl($scope, $q, $filter, ngToast, $uibModalInstance, Groups, Identity, title, message, initialGroup, messageButton, isMovement, toBeMoved, levelOfToBeMoved, canDismiss, noGroupsMessage) {

            $scope.title = title;
            $scope.message = message;
            $scope.canDismiss = canDismiss;
            $scope.noGroupsMessage = noGroupsMessage;
            $scope.messageButton = messageButton;

            $scope.isMovement = isMovement;
            $scope.groupToBeMoved = toBeMoved;
            $scope.levelOfToBeMoved = levelOfToBeMoved;

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

                if($scope.isMovement){

                    if ($scope.levelOfToBeMoved == 1 || $scope.levelOfToBeMoved == 2){
                        ngToast.danger('Grupo selecionado não pode ser movimentado!');
                        return;
                    }

                    if ($scope.levelOfToBeMoved == 3 && $scope.selectedLevelGroup == 3){
                        ngToast.danger('Grupo selecionado não pode ser movimentado para o grupo de mesmo nível!');
                        return;
                    }

                    if ($scope.levelOfToBeMoved == 4 && $scope.selectedLevelGroup == 4){
                        ngToast.danger('Grupo selecionado não pode ser movimentado para o grupo de mesmo nível!');
                        return;
                    }

                    if ($scope.levelOfToBeMoved == 3 && $scope.selectedLevelGroup != 2){
                        ngToast.danger('Grupo selecionado não pode ser movimentado para o grupo indicado!');
                        return;
                    }

                    if ($scope.levelOfToBeMoved == 4 && $scope.selectedLevelGroup != 3){
                        ngToast.danger('Grupo selecionado não pode ser movimentado para o grupo indicado!');
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