(function() {
	angular.module('BuscaAtivaEscolar').run(function ($rootScope, $state, Identity) {
		$rootScope.$on('$stateChangeStart', handleStateChange);

		function handleStateChange(event, toState, toParams, fromState, fromParams, options) {

			//console.log("[router] to=", toState, toParams);

			if(toState.unauthenticated) return;
			if(Identity.isLoggedIn()) return;

			//console.log("[router.guard] Trying to access authenticated state, but currently logged out. Redirecting...");

			event.preventDefault();
			$state.go('login');
		}

	});
})();