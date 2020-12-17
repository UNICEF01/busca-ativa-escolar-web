(function() {
	identify('config', 'on_init.js');

	angular.module('BuscaAtivaEscolar').run(function ($cookies, $rootScope, $state, Identity, Auth, Config, StaticData) {
		//console.info("------------------------------");
		//console.info(" BUSCA ATIVA ESCOLAR");
		//console.info(" Copyright (c) LQDI Digital");
		//console.info("------------------------------");
		//console.info(" WS ENDPOINT: ", Config.getAPIEndpoint());
		//console.info(" STORAGE BUILD PREFIX: ", Config.BUILD_PREFIX);
		//console.info("------------------------------");

		$.material.init();

		$rootScope.$on('unauthorized', function() {
			//console.log('[event.unauthorized] User unauthorized, redirecting to login...');
			Auth.logout();
			$state.go('login');
		})
	})

})();