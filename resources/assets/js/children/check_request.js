(function () {

    angular.module('BuscaAtivaEscolar')
        .config(function ($stateProvider) {
            $stateProvider.state('checks', {
                url: '/checks',
                templateUrl: '/views/children/checks.html',
                controller: 'CheckRequestCtrl'
            });
        })
        .controller('CheckRequestCtrl', function ($scope, $anchorScroll, $httpParamSerializer, API, Children, Decorators, ngToast) {

            $scope.Decorators = Decorators;
            $scope.Children = Children;

            $scope.query = angular.merge({}, $scope.defaultQuery);
            $scope.requests = {};

            $scope.refresh = function () {
                $scope.requests = Children.requests();
            };

            $scope.refresh();

            $scope.aprove = function (child) {

                if (child.type_request === 'reopen') {
                    Children.reopenCase({
                        case_id: child.child.alert.case_id,
                        reason: 'request'
                    }).$promise.then(function (res) {
                        if (res.status !== 'error') {
                            ngToast.success(res.result);
                            setTimeout(function () {
                                window.location = 'children/view/' + res.child_id + '/consolidated';
                            }, 4000);

                        } else {
                            ngToast.danger("Erro ao reabrir o caso!");
                        }
                    });

                }

                if (child.type_request === 'transfer') {
                    Children.transferCase({
                        case_id: child.child.alert.case_id,
                    }).$promise.then(function (res) {
                        if (res.status !== 'error') {
                            ngToast.success(res.result);
                            setTimeout(function () {
                                window.location = 'children/view/' + res.child_id + '/consolidated';
                            }, 4000);

                        } else {
                            ngToast.danger("Erro ao reabrir o caso!");
                        }
                    });
                }


            };
            $scope.reject = function () {
                alert('Rejeitar');
            };
        });
})();
