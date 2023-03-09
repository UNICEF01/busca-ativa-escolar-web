(function () {
    angular
        .module('BuscaAtivaEscolar')
        .factory('Schools', function Schools(API, $resource) {

            var headers = API.REQUIRE_AUTH;

            return $resource(API.getURI('schools/:id'), { id: '@id', with: '@with' }, {
                find: { method: 'GET', headers: headers },
                save: { method: 'POST', headers: headers },
                search: { url: API.getURI('schools/search'), method: 'POST', headers: headers },
                getById: { url: API.getURI('schools/public'), method: 'GET' },
                all_educacenso: { url: API.getURI('schools/all_educacenso'), method: 'GET', headers: headers },
                update: { method: 'PUT', headers: headers },
                send_educacenso_notifications: { url: API.getURI('schools/educacenso/notification'), method: 'POST', headers: headers },
                find: { method: 'GET', headers: headers },
                search: { url: API.getURI('schools/search'), method: 'POST', headers: headers },
                getById: { url: API.getURI('schools/public'), method: 'GET' },
                all_educacenso: { url: API.getURI('schools/all_educacenso'), method: 'GET', headers: headers },
                update: { method: 'PUT', headers: headers },
                send_educacenso_notifications: { url: API.getURI('schools/educacenso/notification'), method: 'POST', headers: headers },
                all_schools: { url: API.getURI('schools/all'), method: 'GET', headers: headers },
                send_frequency_notifications: { url: API.getURI('schools/frequency/notification'), method: 'POST', headers: headers }
            });

        });
})();