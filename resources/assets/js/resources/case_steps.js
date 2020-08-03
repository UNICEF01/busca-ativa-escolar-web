(function() {
	angular
		.module('BuscaAtivaEscolar')
		.factory('CaseSteps', function CaseSteps(API, Identity, $resource) {

			var headers = API.REQUIRE_AUTH;

			var repository = $resource(API.getURI('steps/:type/:id'), {id: '@id', type: '@type', with: '@with'}, {
				find: {method: 'GET', headers: headers},
				save: {method: 'POST', headers: headers},
				complete: {url: API.getURI('steps/:type/:id/complete'), method: 'POST', headers: headers},
				assignableUsers: {url: API.getURI('steps/:type/:id/assignable_users'), method: 'GET', headers: headers},
				assignUser: {url: API.getURI('steps/:type/:id/assign_user'), method: 'POST', headers: headers}
			});

			repository.where = {
				idEquals: function(id) {
					return function(item) { return item.id === id; }
				},

				caseCurrentStepIdEquals: function(id) {
					return function(item) { return item.current_step_id === id; }
				}
			};

			return repository;

		});
})();