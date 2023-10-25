(function () {
    angular
        .module('BuscaAtivaEscolar')
        .service('InjectTimeEndpointSearch', function (Config) {
            this.request = function (config) {
                if (!config.url) return config;

                if (config.url.indexOf("children/search") !== -1) {
                    config.url = config.url + '?nocache=' + new Date().getTime();
                }

                return config;
            };

        });

})();