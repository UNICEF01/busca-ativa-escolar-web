(function() {

    angular.module('BuscaAtivaEscolar').directive('appHeaderWarnings', function(Identity, Platform, Auth) {

        function init(scope) {
            scope.identity = Identity;
            scope.auth = Auth;
            scope.platform = Platform;
        }

        return {
            link: init,
            replace: true,
            templateUrl: '/views/components/header_warnings.html'
        };
    });

})();