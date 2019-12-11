(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Maintenance', function CaseSteps(API, Identity, $resource) {

            var headers = API.REQUIRE_AUTH;

            var debug = true;
            var param = debug ? '?XDEBUG_SESSION_START=PHPSTORM' : '';

            var repository = $resource(API.getURI('maintenance/:user_id'), {user_id: '@id'}, {
                assignForAdminUser: {url: API.getURI('maintenance/:user_id' + param), method: 'POST', headers: headers}
            });
            return repository;
        });
})();