(function() {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Cities', function Cities(API, $resource) {

            var headers = {};

            return $resource(API.getURI('cities/:id'), { id: '@id' }, {
                find: { method: 'GET', headers: headers },
                search: { url: API.getURI('cities/search'), method: 'POST', headers: headers },
                checkIfAvailable: { url: API.getURI('cities/check_availability'), method: 'POST', headers: headers },
            });

        });
})();