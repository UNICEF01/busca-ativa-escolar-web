(function() {

    angular.module('BuscaAtivaEscolar')
        .config(function($stateProvider) {
            $stateProvider.state('state_browser', {
                url: '/states',
                templateUrl: '/views/states/list.html',
                controller: 'StateBrowserCtrl'
            })
        })
        .controller('StateBrowserCtrl', function($scope, StaticData, States, Identity, Config) {

            $scope.identity = Identity;
            $scope.static = StaticData;
            $scope.states = {};
            $scope.query = {
                filter: {},
                sort: {},
                max: 27,
                page: 1
            };

            $scope.refresh = function() {
                $scope.states = States.all($scope.query);
            };

            $scope.export = function() {
                Identity.provideToken().then(function(token) {
                    window.open(Config.getAPIEndpoint() + 'states/export?token=' + token);
                });
            };

            $scope.refresh();

        });

})();