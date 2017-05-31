(function() {
	console.log("[core.load] Loaded: config.js");

	angular
		.module('BuscaAtivaEscolar.Config', [])
		.factory('Config', function Config($rootScope, $cookies) {

			numeral.language('pt-br');
			moment.locale('pt-br');

			function env(key) {
				if(!window.ENVIRONMENT) {
					window.ENVIRONMENT = {
						SERVER_NAME: "Default (not configured)",
						DEFAULT_ENDPOINT: 'prod_https'
					};
				}

				return window.ENVIRONMENT[key];
			}

			var config = {

				BUILD_PREFIX: 'b060.', // @DEPRECATED: see config/local_storage.js instead!

				API_ENDPOINTS: {
					local_http: {
						label: 'V1 Local - Homestead (Insecure)',
						api: 'http://api.busca-ativa-escolar.local/api/v1/',
						token: 'http://api.busca-ativa-escolar.local/api/auth/token',
					},
					homolog_http: {
						label: 'V1 Homolog - web3-lqdi (Insecure)',
						api: 'http://api.busca-ativa-escolar.dev.lqdi.net/api/v1/',
						token: 'http://api.busca-ativa-escolar.dev.lqdi.net/api/auth/token',
					},
					tests_http: {
						label: 'V1 Tests - conexaobrasil (Insecure)',
						api: 'http://api.buscaativateste.conexaobrasil.org/api/v1/',
						token: 'http://api.buscaativateste.conexaobrasil.org/api/auth/token',
					},
					prod_http: {
						label: 'V1 Prod - buscaativaescolar-web1 (Insecure)',
						api: 'http://api.buscaativaescolar.org.br/api/v1/',
						token: 'http://api.buscaativaescolar.org.br/api/auth/token',
					},
					prod_https: {
						label: 'V1 Prod - buscaativaescolar-web1 (Secure)',
						api: 'https://api.buscaativaescolar.org.br/api/v1/',
						token: 'https://api.buscaativaescolar.org.br/api/auth/token',
					}
				},

				NOTIFICATIONS_REFRESH_INTERVAL: 30000, // 30 sec

				TOKEN_EXPIRES_IN: 3600, // 1 hour
				REFRESH_EXPIRES_IN: 1209600, // 2 weeks

				ALLOWED_ENDPOINTS: ['local_http', 'homolog_http', 'tests_http', 'prod_http', 'prod_https'],
				CURRENT_ENDPOINT: env('DEFAULT_ENDPOINT')

			};

			console.log("[core.config] Current environment: ", window.ENVIRONMENT.SERVER_NAME);

			var hasCheckedCookie = false;

			config.setEndpoint = function(endpoint) {
				if(config.ALLOWED_ENDPOINTS.indexOf(endpoint) === -1) {
					console.error("[core.config] Cannot set endpoint to ", endpoint,  ", not in valid endpoints list: ", config.ALLOWED_ENDPOINTS);
					return;
				}

				console.info("[core.config] Setting API endpoint: ", endpoint);
				config.CURRENT_ENDPOINT = endpoint;

				$cookies.put('FDENP_API_ENDPOINT', config.CURRENT_ENDPOINT);
			};

			config.getCurrentEndpoint = function() {
				if(hasCheckedCookie) return config.CURRENT_ENDPOINT;
				hasCheckedCookie = true;

				var cookie = $cookies.get('FDENP_API_ENDPOINT');
				if(cookie) config.setEndpoint($cookies.get('FDENP_API_ENDPOINT'));

				console.info("[core.config] Resolved current API endpoint: ", config.CURRENT_ENDPOINT, "cookie=", cookie);

				return config.CURRENT_ENDPOINT;
			};

			config.getAPIEndpoint = function() {
				return config.API_ENDPOINTS[config.getCurrentEndpoint()].api
			};

			config.getTokenEndpoint = function() {
				return config.API_ENDPOINTS[config.getCurrentEndpoint()].token
			};

			return $rootScope.config = config;

		});

})();
