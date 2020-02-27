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

            $scope.query = angular.merge({}, $scope.defaultQuery);
            $scope.requests = {};

            $scope.refresh = function () {
                $scope.requests = Children.requests();
            };

            $scope.refresh();

            $scope.aprove = function () {
                alert('Aprovar');
            };
            $scope.reject = function () {
                alert('Rejeitar');
            };
        });
})();
