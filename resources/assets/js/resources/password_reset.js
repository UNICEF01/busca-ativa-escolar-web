(function() {
    angular
        .module('BuscaAtivaEscolar')
        .factory('PasswordReset', function Users(API, $resource) {

            var headers = {};

            return $resource(API.getURI('password_reset/:id'), { id: '@id', with: '@with' }, {
                begin: { url: API.getURI('password_reset/begin'), method: 'POST', headers: headers },
                complete: { url: API.getURI('password_reset/complete'), method: 'POST', headers: headers }
            });

        });
})();