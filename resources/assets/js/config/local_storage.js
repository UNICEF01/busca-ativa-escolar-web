(function() {
    identify('config', 'local_storage.js');

    angular.module('BuscaAtivaEscolar').config(function($localStorageProvider) {
        $localStorageProvider.setKeyPrefix('BuscaAtivaEscolar.v075.');
    });

})();