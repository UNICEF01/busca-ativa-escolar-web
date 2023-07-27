(function() {
    angular.module('BuscaAtivaEscolar').run(function($rootScope, $state, Identity) {
        $rootScope.$on('$stateChangeStart', handleStateChange);

        function handleStateChange(event, toState) {



            if (toState.unauthenticated) return;
            if (Identity.isLoggedIn()) return;



            event.preventDefault();
            $state.go('login');
        }

    });
})();