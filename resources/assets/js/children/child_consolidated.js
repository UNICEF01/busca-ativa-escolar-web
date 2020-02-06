(function () {

    angular.module('BuscaAtivaEscolar')
        .controller('ChildConsolidatedCtrl', ChildConsolidatedCtrl)

        .config(function ($stateProvider) {
            $stateProvider
                .state('child_viewer.consolidated', {
                    url: '/consolidated',
                    templateUrl: '/views/children/view/consolidated.html',
                    controller: 'ChildConsolidatedCtrl'
                })
        });

    function ChildConsolidatedCtrl($scope, $state, $location, $stateParams, Children, Decorators, Utils, ngToast) {
        $scope.Decorators = Decorators;
        $scope.Children = Children;
        $scope.showAll = true;

        $scope.refreshChildData = function (callback) {
            return $scope.child = Children.find({id: $scope.child_id, with: 'currentStep,consolidated'}, callback);
        };

        $scope.fields = {};
        $scope.child_id = $stateParams.child_id;
        $scope.id_case_for_reopen = $location.search().id_request ? $location.search().id_request : '';
        $scope.child = $scope.refreshChildData(function (data) {
            var consolidated = Utils.unpackDateFields(data.consolidated, dateOnlyFields)
            angular.copy(consolidated, $scope.fields);
        });

        var dateOnlyFields = ['enrolled_at', 'report_date', 'dob', 'guardian_dob', 'reinsertion_date'];

        $scope.getConsolidatedFields = function () {
            return $scope.fields;
        };

        $scope.isCheckboxChecked = function (field, value) {
            if (!$scope.fields) return false;
            if (!$scope.fields[field]) $scope.fields[field] = [];
            return $scope.fields[field].indexOf(value) !== -1;
        };
        if ($scope.id_case_for_reopen !== '') {
            Children.reopenCase({case_id: $scope.id_case_for_reopen, reason: ''}).$promise.then(function (res) {
                if (res.status !== 'error') {
                    ngToast.success("Caso reaberto com sucess!");
                } else {
                    ngToast.danger("Erro ao reabrir o caso!");
                }
            });
        }


        // console.log("[core] @ChildConsolidatedCtrl", $scope.child);

    }

})();
