(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Classes', function Schools(API, $resource) {
            var Classes = $resource(API.getURI('classes/:id'), {id: '@id'}, {
                find: {method: 'GET', params: {}},
                update: {method: 'PUT'},
                create: {method: 'POST'},
                deleteClasse: {method: 'DELETE', url: API.getURI('classes/:id')},
                updateSettings: {method: 'PUT', url: API.getURI('classes/:id')},
                frequencies: {method: 'GET', params: {}, url: API.getURI('frequencies/:id')},
                updateFrequency: {method: 'PUT', url: API.getURI('frequency/:id')},
                updateFrequencies: {method: 'PUT', url: API.getURI('frequencies')}
            });
            return Classes;
        });
})();