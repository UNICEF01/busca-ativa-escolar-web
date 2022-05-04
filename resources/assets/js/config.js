(function() {

    identify('core', 'config.js');

    angular
        .module('BuscaAtivaEscolar.Config', [])
        .factory('Config', function Config($rootScope, $cookies) {

            numeral.language('pt-br');
            moment.locale('pt-br');

            function env(key) {

                var default_endpoint = 'prod_https';

                switch (location.host) {
                    case 'plataforma.busca-ativa-escolar.test':
                        default_endpoint = 'local_http';
                        break;
                    case 'panel.busca-ativa-escolar.test':
                        default_endpoint = 'local_http';
                        break
                    case 'plataforma.testes.buscaativaescolar.org.br':
                        default_endpoint = 'tests_https';
                        break;
                    case 'plataforma.dev.buscaativaescolar.org.br':
                        default_endpoint = 'dev_https';
                        break;
                    default:
                        default_endpoint = 'prod_https';
                }

                if (!window.ENVIRONMENT) {
                    window.ENVIRONMENT = {
                        SERVER_NAME: "Default (not configured)",
                        DEFAULT_ENDPOINT: default_endpoint
                    };
                }



                return window.ENVIRONMENT[key];
            }

            var config = {

                BUILD_PREFIX: 'b060.', // @DEPRECATED: see config/local_storage.js instead!

                API_ENDPOINTS: {
                    local_http: {
                        label: 'V1 Local - Homestead (Insecure)',
                        api: 'http://api.busca-ativa-escolar.test/api/v1/',
                        token: 'http://api.busca-ativa-escolar.test/api/auth/token',
                    },
                    tests_http: {
                        label: 'V1 Tests - buscaativaescolar-web1 (Insecure)',
                        api: 'http://api.testes.buscaativaescolar.org.br/api/v1/',
                        token: 'http://api.testes.buscaativaescolar.org.br/api/auth/token',
                    },
                    tests_https: {
                        label: 'V1 Tests - buscaativaescolar-web1 (Secure)',
                        api: 'https://api.testes.buscaativaescolar.org.br/api/v1/',
                        token: 'https://api.testes.buscaativaescolar.org.br/api/auth/token',
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
                    },
                    dev_https: {
                        label: 'V1 Dev - buscaativaescolar-web1 (Secure)',
                        api: 'https://api.dev.buscaativaescolar.org.br/api/v1/',
                        token: 'https://api.dev.buscaativaescolar.org.br/api/auth/token',
                    }
                },

                NOTIFICATIONS_REFRESH_INTERVAL: 30000, // 30 sec

                TOKEN_EXPIRES_IN: 3600, // 1 hour
                REFRESH_EXPIRES_IN: 1209600, // 2 weeks

                ALLOWED_ENDPOINTS: ['local_http', 'tests_https', 'prod_https', 'dev_https'],
                CURRENT_ENDPOINT: env('DEFAULT_ENDPOINT')

            };



            var hasCheckedCookie = false;

            config.setEndpoint = function(endpoint) {
                if (config.ALLOWED_ENDPOINTS.indexOf(endpoint) === -1) {

                    return;
                }


                config.CURRENT_ENDPOINT = endpoint;

                $cookies.put('FDENP_API_ENDPOINT', config.CURRENT_ENDPOINT);
            };

            config.getCurrentEndpoint = function() {
                if (hasCheckedCookie) return config.CURRENT_ENDPOINT;
                hasCheckedCookie = true;

                var cookie = $cookies.get('FDENP_API_ENDPOINT');
                if (cookie) config.setEndpoint($cookies.get('FDENP_API_ENDPOINT'));



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