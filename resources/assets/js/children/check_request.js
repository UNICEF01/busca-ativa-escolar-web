(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('checks', {
                url: '/checks',
                templateUrl: '/views/children/checks.html',
                controller: 'CheckRequestCtrl'
            });
        })
        .controller('CheckRequestCtrl', function ($scope, $anchorScroll, $httpParamSerializer, API, Children, Decorators, Modals, DTOptionsBuilder, DTColumnDefBuilder) {

            $scope.Decorators = Decorators;
            $scope.Children = Children;

            $scope.defaultQuery = {
                name: '',
                step_name: '',
                cause_name: '',
                assigned_user_name: '',
                location_full: '',
                alert_status: ['accepted'],
                case_status: ['in_progress'],
                risk_level: ['low', 'medium', 'high'],
                age_null: true,
                gender: ['male', 'female', 'undefined'],
                gender_null: true,
                place_kind: ['rural', 'urban'],
                place_kind_null: true,
            };

            $scope.query = angular.merge({}, $scope.defaultQuery);
            $scope.search = {};

            $scope.refresh = function () {
                $scope.search = Children.requests();
            };

            $scope.resetQuery = function () {
                $scope.query = angular.merge({}, $scope.defaultQuery);
                $scope.refresh();
            };

            $scope.refresh();

            $scope.aprove = function () {
                alert();
            };
            $scope.reject = function () {
                alert();
            };
        });
})();
