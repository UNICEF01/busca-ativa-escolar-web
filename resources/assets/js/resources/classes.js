(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Classes', function Schools(API, $resource) {
            var debug = '?XDEBUG_SESSION_START=PHPSTORM';
            var Classes = $resource(API.getURI('classes/:id'), {id: '@id'}, {
                find: {method: 'GET', params: {}},
                update: {method: 'POST'},
            });
            return Classes;
        });
})();