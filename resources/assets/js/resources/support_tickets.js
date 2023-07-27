(function() {
    angular
        .module('BuscaAtivaEscolar')
        .factory('SupportTicket', function SupportTicket(API, $resource) {

            var authRequiredHeaders = API.REQUIRE_AUTH;
            var authOptionalHeaders = API.OPTIONAL_AUTH;

            return $resource(API.getURI('support/tickets/:id'), { id: '@id' }, {
                all: { url: API.getURI('support/tickets/all'), method: 'POST', headers: authRequiredHeaders },
                submit: { url: API.getURI('support/tickets/submit'), method: 'POST', headers: authOptionalHeaders },
                find: { method: 'GET', headers: authRequiredHeaders }
            });

        });
})();