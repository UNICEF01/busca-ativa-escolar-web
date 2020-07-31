(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Classes', function Schools(API, $resource) {
            var debug = '?XDEBUG_SESSION_START=PHPSTORM';
            var Classes = $resource(API.getURI('classes/:id' + debug), {id: '@id'}, {
                find: {method: 'GET', params: {}},
                update: {method: 'PUT'},
                create: {method: 'POST'},
                updateSettings: {method: 'PUT', url: API.getURI('classes/:id')},
            });
            return Classes;
        });
})();