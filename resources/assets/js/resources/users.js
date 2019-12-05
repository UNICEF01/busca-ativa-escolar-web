(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Users', function Users(API, $resource) {
            var headers = API.REQUIRE_AUTH;
            var debug = true;
            var param = debug ? '?XDEBUG_SESSION_START=PHPSTORM' : '';
            return $resource(API.getURI('users/:id' + param), {id: '@id', with: '@with'}, {
                myself: {url: API.getURI('users/myself'), method: 'GET', headers: headers},
                find: {method: 'GET', headers: headers},
                create: {method: 'POST', headers: headers},
                update: {method: 'PUT', headers: headers},
                search: {url: API.getURI('users/search'), method: 'POST', isArray: false, headers: headers},
                suspend: {method: 'DELETE', headers: headers},
                restore: {url: API.getURI('users/:id/restore'), method: 'POST', headers: headers},
            });

        });
})();