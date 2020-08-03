(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Maintenance', function CaseSteps(API, Identity, $resource) {
            var headers = API.REQUIRE_AUTH;
            var repository = $resource(API.getURI('maintenance/:user_id'), {user_id: '@id'}, {
                assignForAdminUser: {url: API.getURI('maintenance/:user_id'), method: 'POST', headers: headers}
            });
            return repository;
        });
})();