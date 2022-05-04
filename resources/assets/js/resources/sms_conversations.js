(function() {
    angular
        .module('BuscaAtivaEscolar')
        .factory('SmsConversations', function SmsConversations(API, $resource) {

            var authHeaders = API.REQUIRE_AUTH;

            return $resource(API.getURI('maintenance/sms_conversations/:id'), { id: '@id' }, {
                find: { method: 'GET', headers: authHeaders },
                all: { url: API.getURI('maintenance/sms_conversations'), method: 'GET', headers: authHeaders },
            });

        });
})();