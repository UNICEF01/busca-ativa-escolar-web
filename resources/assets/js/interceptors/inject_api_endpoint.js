(function() {
	angular
		.module('BuscaAtivaEscolar')
		.service('InjectAPIEndpointInterceptor', function ($q, $rootScope, Config) {

			this.request = function (config) {

				// Fixes weird bug with ng-file-uploader clearing the content type globally
				//config.headers['Content-Type'] = "application/json";

				if(!config.url) return config;

				config.url = config.url.replace(/@@API@@/g, Config.getAPIEndpoint());
				config.url = config.url.replace(/@@TOKEN@@/g, Config.getTokenEndpoint());

				return config;

			};

		});

})();