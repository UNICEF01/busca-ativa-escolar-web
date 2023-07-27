(function() {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Alerts', function Alerts(API, $resource) {

            var headers = API.REQUIRE_AUTH;

            return $resource(API.getURI('alerts/:id'), { id: '@id' }, {
                find: { method: 'GET', headers: headers },
                getPending: { url: API.getURI('alerts/pending'), isArray: false, method: 'GET', headers: headers },
                mine: { url: API.getURI('alerts/mine'), isArray: false, method: 'GET', headers: headers },
                accept: { url: API.getURI('alerts/:id/accept'), method: 'POST', headers: headers },
                edit: { url: API.getURI('alerts/edit'), method: 'POST', headers: headers },
                reject: { url: API.getURI('alerts/:id/reject'), method: 'POST', headers: headers },
                changeGroups: { url: API.getURI('alerts/change_groups'), method: 'POST', headers: headers }
            });
        });
})();