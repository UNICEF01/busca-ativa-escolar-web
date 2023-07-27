(function() {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Cases', function Cases(API, $resource) {

            var headers = API.REQUIRE_AUTH;

            return $resource(API.getURI('cases/:id'), { id: '@id', with: '@with' }, {
                find: { method: 'GET', headers: headers },
                update: { method: 'PUT', headers: headers },
                changeGroups: { method: 'POST', url: API.getURI('cases/change_groups'), headers: headers }
            });

        });
})();