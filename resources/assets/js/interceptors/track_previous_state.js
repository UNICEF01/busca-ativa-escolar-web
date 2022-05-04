(function() {
    angular.module('BuscaAtivaEscolar').run(function($rootScope) {
        $rootScope.$on('$stateChangeStart', handleStateChange);

        function handleStateChange(toState, toParams, fromState, fromParams) {

            $rootScope.previousState = fromState;
            $rootScope.previousStateParams = fromParams;
            $rootScope.currentState = toState;
            $rootScope.currentStateParams = toParams;
        }

    });
})();