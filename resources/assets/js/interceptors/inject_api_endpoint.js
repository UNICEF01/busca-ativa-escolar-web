(function() {
    angular
        .module('BuscaAtivaEscolar')
        .service('InjectAPIEndpointInterceptor', function(Config) {

            this.request = function(config) {

                // Fixes weird bug with ng-file-uploader clearing the content type globally


                if (!config.url) return config;

                config.url = config.url.replace(/@@API@@/g, Config.getAPIEndpoint());
                config.url = config.url.replace(/@@TOKEN@@/g, Config.getTokenEndpoint());

                return config;

            };

        });

})();