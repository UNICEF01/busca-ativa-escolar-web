(function() {
    angular
        .module('BuscaAtivaEscolar')
        .factory('UserPreferences', function UserPreferences(API, $resource) {

            var authHeaders = API.REQUIRE_AUTH;

            return $resource(API.getURI('user_preferences'), { id: '@id' }, {
                get: { method: 'GET', isArray: false, headers: authHeaders },
                update: { method: 'POST', headers: authHeaders },
            });

        });
})();