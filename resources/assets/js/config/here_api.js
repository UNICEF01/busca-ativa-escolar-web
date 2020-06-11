(function () {
    identify('config', 'here_api.js');

    angular.module('BuscaAtivaEscolar').config(["HereMapsConfigProvider", function (HereMapsConfigProvider) {
        HereMapsConfigProvider.setOptions({
            app_id: 'IaV356sfi2gAreQwtVsB',
            app_code: 'cVhEI2VX0p26k_Rdz_NpbL-zV1eo5rDkTe2BoeJcE9U',
            useHTTPS: true,
            apiVersion: '3.0',
            useCIT: true,
            mapTileConfig: {
                scheme: 'reduced.day',
                size: 256,
                format: 'png8',
                metadataQueryParams: {}
            }
        });
    }]);
})();

